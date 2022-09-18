import { ServerTransport } from './net/ServerTransport.js'

export class ServerEntry {
    #transport = undefined

    constructor() {
        this.#transport = new ServerTransport(
            this.#onopen,
            this.#onmessage,
            this.#onerror,
            this.#onclose
        )
    }

    #onopen = conn => {
        console.log(`connected [${conn}]`)
        this.#transport.send(conn, { type: 'welcome', conn: conn })
    }

    #onmessage = message => {
        this.#transport.broadcast(message)
    }

    #onerror = ev => {
        console.log(`error ${ev}`)
    }

    #onclose = (conn, code) => {
        console.log(`disconnected [${conn}] with code ${code}`)
        this.#transport.broadcast({ type: 'goodluck', conn: conn })
    }
}

export function ServerEntryFunctional() {
    const transport = new ServerTransport(onopen, onmessage, onerror, onclose)

    function onopen(conn) {
        console.log(`connected [${conn}]`)
        transport.send(conn, { type: 'welcome', conn: conn })
    }

    function onmessage(message) {
        transport.broadcast(message)
    }

    function onerror(ev) {
        console.log(`error ${ev}`)
    }

    function onclose(conn, code) {
        console.log(`disconnected [${conn}] with code ${code}`)
        transport.broadcast({ type: 'goodluck', conn: conn })
    }
}

export function ServerEntryFunctionalArrow() {
    const onopen = conn => {
        console.log(`connected [${conn}]`)
        transport.send(conn, { type: 'welcome', conn: conn })
    }

    const onmessage = message => {
        transport.broadcast(message)
    }

    const onerror = ev => {
        console.log(`error ${ev}`)
    }

    const onclose = (conn, code) => {
        console.log(`disconnected [${conn}] with code ${code}`)
        transport.broadcast({ type: 'goodluck', conn: conn })
    }

    const transport = new ServerTransport(onopen, onmessage, onerror, onclose)
}
