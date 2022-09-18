export class Data {
    #value = undefined
    #observers = []

    constructor(value) {
        this.#value = value
    }

    get value() {
        return this.#value
    }

    set value(value) {
        this.#observers.forEach(x => x.func.call(x.obj, this.#value, value))
        this.#value = value
    }

    subscribe = observer => {
        this.#observers.push(observer)
    }

    unsubscribe = observer => {
        this.#observers = this.#observers.filter(x => x !== observer)
    }
}
