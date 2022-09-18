export class Rotate {
    #view = undefined
    #rotationBuffer = undefined

    constructor(view) {
        this.#view = view
        this.#rotationBuffer = view.rotation.clone()
    }

    reached = delta => {
        this.#rotationBuffer.multiply(delta)

        if (this.#rotationBuffer.angleTo(this.#view.targetRotation) < 0.2) {
            return false
        }

        return this.#rotationBuffer
    }
}
