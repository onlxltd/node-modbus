# node-modbus

A pure JavaScript implementation of MODBUS for NodeJS.

[![NPM download](https://img.shields.io/npm/dm/modbus-serial.svg)](http://www.npm-stats.com/~packages/modbus-serial)
[![NPM version](https://badge.fury.io/js/modbus-serial.png)](http://badge.fury.io/js/modbus-serial)
![Build Status](https://github.com/yaacov/node-modbus-serial/workflows/ci/badge.svg)


Modbus is a serial communications protocol, first used in 1979.
Modbus is simple and robust, openly published, royalty-free and
easy to deploy and maintain.

**This package makes Modbus calls and serve fun and easy.**

----

- [What can I do with this module ?](#what-can-i-do-with-this-module-)
- [Compatibility](#compatibility)
- [Examples](#examples)
- [Methods](https://github.com/yaacov/node-modbus-serial/wiki/Methods)

----


#### What can I do with this module ?

This class makes it fun and easy to communicate with electronic
devices such as irrigation controllers, protocol droids and robots.
Many industrial electronic devices implement modbus.
Arduino can also talk modbus and you can control your projects and robots
using modbus.

Arduino libraries for modbus slave:
* https://github.com/yaacov/arduino-modbus-slave
* https://github.com/smarmengol/Modbus-Master-Slave-for-Arduino

Arduino sketch for irrigation timer with modbus support:
* https://github.com/yaacov/arduino-irrigation-timer

Node Modbus-WebSocket bridge:
* https://github.com/yaacov/node-modbus-ws

#### Compatibility

###### Version of NodeJS:
This module has not been tested on every single version of NodeJS. For best results you should stick to LTS versions, which are denoted by even major version numbers e.g. 4.x, 6.x, 8.x.

###### These classes are implemented:

| Class | Function |
|-------|----------|
| FC1 "Read Coil Status" | `readCoils(coil, len)` |
| FC2 "Read Input Status" | `readDiscreteInputs(addr, arg)` |
| FC3 "Read Holding Registers" | `readHoldingRegisters(addr, len) ` |
| FC4 "Read Input Registers" | `readInputRegisters(addr, len) ` |
| FC5 "Force Single Coil" | `writeCoil(coil, binary) //NOT setCoil` |
| FC6 "Preset Single Register" | `writeRegister(addr, value)` |
 | FC15 "Force Multiple Coil" | `writeCoils(addr, valueAry)` |
| FC16 "Preset Multiple Registers" | `writeRegisters(addr, valueAry)` |
| FC43/14 "Read Device Identification" (supported ports: TCP, RTU) | `readDeviceIdentification(id, obj)` |

###### Client TCP:

* modbus-TCP (TcpPort): Over TCP/IP line.
* modbus-RTU (UdpPort): Over C701 server, commercial UDP to serial bridge.
* modbus-RTU (TcpRTUBufferedPort): Over TCP/IP line, TCP/IP serial RTU buffered device.
* modbus-RTU (TelnetPort): Over Telnet server, TCP/IP serial bridge.

###### Server

* modbus-TCP (ServerTCP): Over TCP/IP line.


#### Examples


----
###### Logger TCP
``` javascript
// create an empty modbus client
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

// open connection to a tcp line
client.connectTCP("127.0.0.1", { port: 8502 });
client.setID(1);

// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function() {
    client.readHoldingRegisters(0, 10, function(err, data) {
        console.log(data.data);
    });
}, 1000);
```
----
###### Logger UDP
``` javascript
// create an empty modbus client
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

// open connection to a udp line
client.connectUDP("127.0.0.1", { port: 8502 });
client.setID(1);

// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function() {
    client.readHoldingRegisters(0, 10, function(err, data) {
        console.log(data.data);
    });
}, 1000);
```
----
###### ModbusTCP Server
``` javascript
// create an empty modbus client
const ModbusRTU = require("modbus-serial");
const vector = {
    getInputRegister: function(addr, unitID) {
        // Synchronous handling
        return addr;
    },
    getHoldingRegister: function(addr, unitID, callback) {
        // Asynchronous handling (with callback)
        setTimeout(function() {
            // callback = function(err, value)
            callback(null, addr + 8000);
        }, 10);
    },
    getCoil: function(addr, unitID) {
        // Asynchronous handling (with Promises, async/await supported)
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve((addr % 2) === 0);
            }, 10);
        });
    },
    setRegister: function(addr, value, unitID) {
        // Asynchronous handling supported also here
        console.log("set register", addr, value, unitID);
        return;
    },
    setCoil: function(addr, value, unitID) {
        // Asynchronous handling supported also here
        console.log("set coil", addr, value, unitID);
        return;
    },
    readDeviceIdentification: function(addr) {
        return {
            0x00: "MyVendorName",
            0x01: "MyProductCode",
            0x02: "MyMajorMinorRevision",
            0x05: "MyModelName",
            0x97: "MyExtendedObject1",
            0xAB: "MyExtendedObject2"
        };
    }
};

// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:8502");
const serverTCP = new ModbusRTU.ServerTCP(vector, { host: "0.0.0.0", port: 8502, debug: true, unitID: 1 });

serverTCP.on("socketError", function(err){
    // Handle socket error if needed, can be ignored
    console.error(err);
});
```
----