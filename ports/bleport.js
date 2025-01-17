/* globals navigator */

"use strict";

const { EventEmitter } = require("events");

/**
 * Bluetooth Low Energy port for Modbus.
 */
class BlePort extends EventEmitter {
    constructor(options) {
        super();

        if (typeof(options) === "undefined") options = {};

        this._bluetooth = options.bluetooth || navigator.bluetooth;
        this._txServiceUuid = options.txService;
        this._txCharacteristicUuid = options.txCharacteristic;
        this._rxServiceUuid = options.rxService;
        this._rxCharacteristicUuid = options.rxCharacteristic;

        this._boundHandleDisconnection = this._handleDisconnection.bind(this);
        this._boundHandleCharacteristicValueChanged = this._handleCharacteristicValueChanged.bind(this);
    }

    get isOpen() {
        return Boolean(this._device) && this._device.gatt.connected;
    }

    async open(callback) {
        let error;
        try {
            const options = {
                filters: [{ services: [this._txServiceUuid] }],
                optionalServices: [this._txServiceUuid, this._rxServiceUuid]
            };
            this._device = await this._bluetooth.requestDevice(options);

            this._device.addEventListener("gattserverdisconnected", this._boundHandleDisconnection);

            this._server = await this._device.gatt.connect();

            this._txService = await this._server.getPrimaryService(this._txServiceUuid);
            this._txCharacteristic = await this._txService.getCharacteristic(this._txCharacteristicUuid);

            this._rxService = await this._server.getPrimaryService(this._rxServiceUuid);

            this._rxCharacteristic = await this._rxService.getCharacteristic(this._rxCharacteristicUuid);

            await this._rxCharacteristic.startNotifications();

            this._rxCharacteristic.addEventListener("characteristicvaluechanged", this._boundHandleCharacteristicValueChanged);
        } catch (_error) {
            error = _error;
        }

        if (callback) {
            callback(error);
        }
    }

    async close(callback) {
        let error;
        try {
            if (this._rxCharacteristic) {
                await this._rxCharacteristic.stopNotifications();

                this._rxCharacteristic.removeEventListener("characteristicvaluechanged", this._boundHandleCharacteristicValueChanged);
            }

            if (this._device) {

                this._device.removeEventListener("gattserverdisconnected", this._boundHandleDisconnection);

                if (this._device.gatt.connected) {
                    this._device.gatt.disconnect();
                }
            }
        } catch (_error) {
            error = _error;
        }

        if (callback) {
            callback(error);
        }
    }

    /**
     * Writes raw data to the TX characteristic.
     * @param {Buffer} data
     * @returns {Promise}
     */
    async write(data) {
        await this._txCharacteristic.writeValue(BlePort._bufferToArrayBuffer(data));
    }

    _handleDisconnection() {
        this.emit("close");
    }

    /**
     * Handles a received GATT value change event.
     * @param event
     * @private
     */
    _handleCharacteristicValueChanged(event) {
        const dataView = event.target.value;
        const buffer = Buffer.from(dataView.buffer, dataView.byteOffset, dataView.byteLength);
        this.emit("data", buffer);
    }

    /**
     * Converts a Node.js `Buffer` to an `ArrayBuffer`.
     * @param {Buffer} buffer
     * @returns {ArrayBuffer}
     * @private
     */
    static _bufferToArrayBuffer(buffer) {
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
}

module.exports = BlePort;
