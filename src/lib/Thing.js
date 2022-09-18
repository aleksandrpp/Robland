import { Model } from './model/Model.js'
import { Move } from './service/Move.js'
import { Rotate } from './service/Rotate.js'
import { factory } from './Factory.js'
import { View } from './View.js'
import { Data } from './model/Data.js'
import { scene } from './Scene.js'
import { Vector3 } from 'three'

export class Thing {
    #model = undefined
    #view = undefined

    constructor(name, local_permission, position, rotation) {
        this.#model = new Model({
            name: new Data(name),
            text: new Data(''),
            local_permission: new Data(local_permission),
            position: new Data(position),
            rotation: new Data(rotation),
        })

        this.#view = new View(
            this.#model,
            factory.create('thing', {
                position: this.#model.get('position').value,
                rotation: this.#model.get('rotation').value,
            }),
            factory.characterPanel({
                position: new Vector3(0, 0.75, 0),
                content: name,
            })
        )

        this.move = new Move(this.#view)
        this.rotate = new Rotate(this.#view)

        if (local_permission) {
            scene.setTarget(this.#view)
        }
    }

    get model() {
        return this.#model
    }

    get view() {
        return this.#view
    }

    update = deltaTime => {
        this.#view.update(deltaTime)
    }

    dispose = () => {
        this.#view.dispose()
    }
}
