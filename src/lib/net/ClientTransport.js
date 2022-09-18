import config from '../../../config.js'

export class ClientTransport {
    #connection = undefined

    constructor(onopen, onmessage, onerror, onclose) {
        this.#connection = new WebSocket(
            `ws://${config.webSocketAddress}:${config.webSocketPort}/ws`
        )

        this.#connection.onopen = ev => {
            onopen(ev)
        }

        this.#connection.onmessage = message => {
            onmessage(JSON.parse(message.data))
        }

        this.#connection.onerror = ev => {
            onerror(ev)
        }

        this.#connection.onclose = ev => {
            onclose(ev)
        }
    }

    send = message => {
        this.#connection.send(JSON.stringify(message))
    }
}
