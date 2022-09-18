export class Model {
    #data = {}

    constructor(data) {
        this.#data = data
    }

    get = key => this.#data[key]
}
