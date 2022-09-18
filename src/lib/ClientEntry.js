import { Thing } from './Thing.js'
import { scene } from './Scene.js'
import { Vector3, Euler, Quaternion, Clock } from 'three'
import { cursor } from './Cursor.js'
import { factory } from './Factory.js'
import { ClientTransport } from './net/ClientTransport.js'
import { match, and, not } from 'babel-plugin-proposal-pattern-matching/match.js'

// TODO: Commander pattern impl
export class ClientEntry {
    #transport = undefined
    #things = []
    #conn = undefined

    #clock = undefined
    #deltaTime = undefined

    #onlineCounter = undefined
    #inputText = undefined

    constructor() {
        this.#clock = new Clock()
        this.#transport = new ClientTransport(
            this.#onopen,
            this.#onmessage,
            this.#onerror,
            this.#onclose
        )

        this.#awake()
    }

    #onopen = ev => {
        console.log(`connected`)
    }

    #addUserPanel = () => {
        const label = factory.userPanel()

        document.body.appendChild(label)

        window.onkeydown = ev => {
            if (ev.keyCode == 13) this.#parseText()
        }

        document.getElementById('sendText').onclick = ev => {
            this.#parseText()
        }

        label.onmousedown = ev => {
            ev.stopPropagation()
        }

        label.ontouchstart = ev => {
            ev.stopPropagation()
        }

        this.#onlineCounter = document.getElementById('onlineCounter')
        this.#inputText = document.getElementById('text')

        document.getElementById('sendName').onclick = ev => {
            this.#sendName()
        }
    }

    #sendName = () => {
        const name = String(this.#inputText.value)
        localStorage.setItem('name', name)
        if (name) {
            this.#transport.send({
                type: 'name',
                conn: this.#conn,
                name: name,
            })
            this.#inputText.value = ''
        }
    }

    #parseText = () => {
        const text = String(this.#inputText.value)

        if (text.toLowerCase().split(' ')[0] === '/dance') {
            this.#transport.send({
                type: 'dance',
                conn: this.#conn,
            })
            this.#inputText.value = ''
            return
        }

        if (text) {
            this.#transport.send({
                type: 'text',
                conn: this.#conn,
                text: text,
            })
            this.#inputText.value = ''
        }
    }

    #welcomeMessage = message => {
        console.log(`characterize [${message.conn}]`)
        let name = localStorage.getItem('name')
        if (!name) name = `Anon_${message.conn}`
        const position = new Vector3()
        const rotation = new Quaternion()
        this.#things[message.conn] = new Thing(name, true, position, rotation)
        this.#conn = message.conn

        this.#transport.send({
            type: 'character',
            conn: message.conn,
            name: name,
            position: position.toArray(),
            rotation: rotation.toArray(),
        })

        this.#addUserPanel()
        this.#onlineCounter.innerHTML = this.thingCount
    }

    #characterMessage = message => {
        this.#things[message.conn] = new Thing(
            message.name,
            false,
            new Vector3().fromArray(message.position),
            new Quaternion().fromArray(message.rotation)
        )

        const m = this.#things[this.#conn].model
        this.#transport.send({
            type: 'reply',
            conn: this.#conn,
            name: m.get('name').value,
            position: m.get('position').value.toArray(),
            rotation: m.get('rotation').value.toArray(),
        })
        this.#onlineCounter.innerHTML = this.thingCount
    }

    #replyMessage = message => {
        if (!this.#things[message.conn])
            this.#things[message.conn] = new Thing(
                message.name,
                false,
                new Vector3().fromArray(message.position),
                new Quaternion().fromArray(message.rotation)
            )

        this.#onlineCounter.innerHTML = this.thingCount
    }

    #goodluckMessage = message => {
        this.#removeThing(message.conn)
        this.#onlineCounter.innerHTML = this.thingCount
    }

    #textMessage = message => {
        this.#things[message.conn].model.get('text').value = message.text
    }

    #nameMessage = message => {
        this.#things[message.conn].model.get('name').value = message.name
    }

    #danceMessage = message => {
        this.#things[message.conn].model.get('text').value = '┏(-_-)┛┗(-_-)┓'
        this.#things[message.conn].view.dance()
    }

    #positionMessage = message => {
        this.#things[message.conn].model.get('position').value = new Vector3().fromArray(
            message.value
        )
    }

    #rotationMessage = message => {
        this.#things[message.conn].model.get('rotation').value = new Quaternion().fromArray(
            message.value
        )
    }

    #onmessage = message => {
        match(message)(
            ({ type = 'welcome' }) => this.#welcomeMessage(message),
            ({ type = 'character', conn = not(this.#conn) }) => this.#characterMessage(message),
            ({ type = 'reply', conn = not(this.#conn) }) => this.#replyMessage(message),
            ({ type = 'goodluck' }) => this.#goodluckMessage(message),
            ({ type = 'text' }) => this.#textMessage(message),
            ({ type = 'name' }) => this.#nameMessage(message),
            ({ type = 'dance' }) => this.#danceMessage(message),
            ({ type = 'position', conn = not(this.#conn) }) => this.#positionMessage(message),
            ({ type = 'rotation', conn = not(this.#conn) }) => this.#rotationMessage(message),
            _ => _
        )
    }

    #onerror = ev => {
        console.log(`error`)
    }

    get thingCount() {
        return this.#things.filter(x => x).length
    }

    #removeThing = conn => {
        this.#things[conn]?.dispose()
        this.#things[conn] = undefined
    }

    #onclose = ev => {
        console.log(`disconnected ${this.#conn} with code ${ev.code}`)
        this.#removeThing(this.#conn)
    }

    #updateThing = x => {
        if (x.model.get('local_permission').value === true) {
            if (cursor.pressed) {
                this.#updatePosition(x)
                this.#updateRotation(x)
            }
        }

        x.update(this.#deltaTime)
    }

    #updatePosition = x => {
        const position = x.move.reached(
            new Vector3(0, 0, -4 * this.#deltaTime).applyQuaternion(x.model.get('rotation').value)
        )
        if (position !== false) {
            x.model.get('position').value = position
            this.#transport.send({
                type: 'position',
                conn: this.#conn,
                value: position.toArray(),
            })
        }
    }

    #updateRotation = x => {
        const rotation = x.rotate.reached(
            new Quaternion().setFromEuler(new Euler(0, cursor.delta.x * -600 * this.#deltaTime, 0))
        )
        if (rotation !== false) {
            x.model.get('rotation').value = rotation
            this.#transport.send({
                type: 'rotation',
                conn: this.#conn,
                value: rotation.toArray(),
            })
        }
    }

    #update = () => {
        this.#deltaTime = this.#clock.getDelta()
        this.#things.filter(x => x).forEach(this.#updateThing)

        scene.update()

        // Recursive update
        window.requestAnimationFrame(this.#update)
    }

    #awake = () => {
        console.log(`awake`)

        this.#update()

        window.onresize = ev => {
            scene.resize()
        }

        window.ontouchstart = ev => {
            if (ev.touches.length > 0) {
                cursor.setOffset(ev.touches[0].pageX, ev.touches[0].pageY)
            }
        }

        window.onmousedown = ev => {
            cursor.setOffset(ev.clientX, ev.clientY)
        }

        window.ontouchcancel = ev => {
            cursor.pressed = false
        }

        window.ontouchend = ev => {
            cursor.pressed = false
        }

        window.onmouseup = ev => {
            cursor.pressed = false
        }

        window.ontouchmove = ev => {
            if (ev.touches.length > 0) {
                cursor.set(ev.touches[0].pageX, ev.touches[0].pageY)
            }
        }

        window.onmousemove = ev => {
            cursor.set(ev.clientX, ev.clientY)
        }
    }
}
