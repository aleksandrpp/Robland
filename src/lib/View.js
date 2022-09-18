import * as THREE from 'three'
import { Quaternion, Vector3 } from 'three'
import { scene } from './Scene.js'

export class View {
    #object = undefined
    #panel = undefined
    #text = undefined
    #name = undefined

    #positionData = undefined
    #rotationData = undefined
    #nameData = undefined
    #textData = undefined
    #targetPosition = undefined
    #targetRotation = undefined

    #mixer = undefined
    #idleAction = undefined
    #runAction = undefined
    #danceAction = undefined

    #danceState = undefined
    #hideText = undefined

    constructor(model, { object, animations }, { panel, text, name }) {
        this.#object = object
        this.#panel = panel
        this.#text = text
        this.#name = name

        this.add(this.#panel)

        this.#positionData = model.get('position')
        this.#rotationData = model.get('rotation')
        this.#nameData = model.get('name')
        this.#textData = model.get('text')

        this.#targetPosition = new Vector3().copy(this.#positionData.value)
        this.#targetRotation = new Quaternion().copy(this.#rotationData.value)

        this.#subscribe()

        scene.add(this.#object)

        this.#mixer = new THREE.AnimationMixer(this.#object)
        this.#idleAction = this.#startAction(this.#mixer.clipAction(animations.idle))
        this.#runAction = this.#startAction(this.#mixer.clipAction(animations.run))
        this.#danceAction = this.#startAction(this.#mixer.clipAction(animations.dance))
    }

    #startAction = action => {
        action.enable = true
        action.setEffectiveTimeScale(1)
        action.setEffectiveWeight(1)
        action.play()
        return action
    }

    dispose = () => {
        scene.remove(this.#object)
        this.#unsubscribe()
        this.#panel.element.remove()
    }

    get position() {
        return this.#object.position
    }

    get targetPosition() {
        return this.#targetPosition
    }

    get targetRotation() {
        return this.#targetRotation
    }

    get rotation() {
        return this.#object.quaternion
    }

    add = child => {
        this.#object.add(child)
    }

    dance = () => {
        this.#danceState = true
    }

    #positionUpdate = (fromValue, toValue) => {
        this.#targetPosition.copy(toValue)
    }

    #rotationUpdate = (fromValue, toValue) => {
        this.#targetRotation.copy(toValue)
    }

    #nameUpdate = (fromValue, toValue) => {
        this.#name.textContent = toValue
    }

    #textUpdate = (fromValue, toValue) => {
        this.#text.textContent = toValue
        this.#text.style.visibility = 'visible'

        clearTimeout(this.#hideText)
        this.#hideText = setTimeout(() => {
            this.#text.style.visibility = 'hidden'
        }, 3000)
    }

    #stateUpdate = state =>
        ({
            enable: (this.#object.visible = true),
            disable: (this.#object.visible = false),
        }[state])

    update = deltaTime => {
        this.#object.position.lerp(this.#targetPosition, deltaTime * 8)
        this.#object.quaternion.slerp(this.#targetRotation, deltaTime * 8)

        const distance = this.#object.position.distanceToSquared(this.#targetPosition)

        if (distance > 0.1) {
            this.#danceState = false
        }

        if (!this.#danceState) {
            this.#idleAction.setEffectiveWeight(1 - distance)
            this.#runAction.setEffectiveWeight(distance * 600)
            this.#danceAction.setEffectiveWeight(0)
        } else {
            this.#danceAction.setEffectiveWeight(1)
        }

        this.#mixer.update(deltaTime)
    }

    #subscribe = () => {
        this.#positionData.subscribe({ obj: this, func: this.#positionUpdate })
        this.#rotationData.subscribe({ obj: this, func: this.#rotationUpdate })
        this.#nameData.subscribe({ obj: this, func: this.#nameUpdate })
        this.#textData.subscribe({ obj: this, func: this.#textUpdate })
    }

    #unsubscribe = () => {
        this.#positionData.unsubscribe({ obj: this, func: this.#positionUpdate })
        this.#rotationData.unsubscribe({ obj: this, func: this.#rotationUpdate })
        this.#nameData.unsubscribe({ obj: this, func: this.#nameUpdate })
        this.#textData.unsubscribe({ obj: this, func: this.#textUpdate })
    }
}
