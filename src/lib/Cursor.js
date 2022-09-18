class Cursor {
    #pressed = false
    #default = { x: 0, y: 0 }
    #offset = { ...this.#default }
    #point = { ...this.#default }

    get pressed() {
        return this.#pressed
    }

    set pressed(value) {
        if (!value) {
            this.#pressed = value
            this.#offset = { ...this.#default }
            this.#point = { ...this.#default }
        }
    }

    get delta() {
        const delta = { x: this.#point.x - this.#offset.x, y: this.#point.y - this.#offset.y }
        this.#offset = { ...this.#point }
        return delta
    }

    setOffset = (x, y) => {
        this.#pressed = true
        this.#offset = this.#normalize(x, y)
        this.#point = { ...this.#offset }
    }

    set = (x, y) => {
        if (this.#pressed) {
            this.#point = this.#normalize(x, y)
        }
    }

    #normalize = (x, y) => ({
        x: x / window.innerWidth,
        y: y / window.innerHeight,
    })
}

export const cursor = new Cursor()
