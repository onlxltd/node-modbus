const Modbus = require('.')

const client = new Modbus()
client.connectTCP('10.0.1.103', { port: 502 })
client.setID(255)

let state = false
setInterval(() => {
    client.writeCoil(0, state, function(err, data) {
        console.log(err, data)
    })
    state = !state
}, 1000)