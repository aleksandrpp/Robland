import { WebSocketServer } from 'ws'
import config from '../../../config.js'

export class ServerTransport {
    #server = undefined
    #connections = []

    constructor(onopen, onmessage, onerror, onclose) {
        this.#server = new WebSocketServer({ port: config.webSocketPort })

        this.#server.on('connection', connection => {
            const conn = this.#connections.push(connection) - 1
            onopen(conn)

            connection.on('message', message => {
                onmessage(JSON.parse(message))
            })

            connection.on('error', ev => {
                onerror(ev)
            })

            connection.on('close', close => {
                const conn = this.#connections.indexOf(connection)
                onclose(conn, close)
                this.#connections[this.#connections.indexOf(connection)] = undefined
            })
        })

        console.log(`websocket server on ${config.webSocketPort}`)
    }

    send = (conn, message) => {
        this.#connections[conn].send(JSON.stringify(message))
    }

    broadcast = ev => {
        for (const connection of this.#connections.filter(x => x)) {
            connection.send(JSON.stringify(ev))
        }
    }
}
