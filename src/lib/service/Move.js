export class Move {
    #view = undefined
    #positionBuffer = undefined

    constructor(view) {
        this.#view = view
        this.#positionBuffer = view.position.clone()
    }

    reached = delta => {
        this.#positionBuffer.add(delta)

        if (this.#positionBuffer.distanceToSquared(this.#view.targetPosition) < 0.2) {
            return false
        }

        return this.#positionBuffer
    }
}
