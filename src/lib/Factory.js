import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

class Factory {
    #gltfLoader = undefined
    #fontLoader = undefined
    #cubeLoader = undefined
    #thingGeo = {}
    #enviroGeo = undefined
    #planeGeo = undefined
    #enviroMat = undefined
    #textMat = undefined
    #font = undefined

    constructor() {
        this.#gltfLoader = new GLTFLoader()
        this.#fontLoader = new FontLoader()
        this.#cubeLoader = new THREE.CubeTextureLoader()

        this.#enviroGeo = new THREE.BoxBufferGeometry(1, 1, 1)
        this.#planeGeo = new THREE.PlaneBufferGeometry(50, 50)

        this.#enviroMat = new THREE.MeshStandardMaterial({
            envMapIntensity: 5,
            metalness: 0.5,
            roughness: 0,
        })

        this.#textMat = new THREE.MeshBasicMaterial({
            color: 0x006699,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
        })
    }

    loaded = async () => {
        const [run, idle, dance, envMap, font] = await Promise.all([
            this.#gltfLoader.loadAsync('/models/Bot/Run.glb'),
            this.#gltfLoader.loadAsync('/models/Bot/Idle.glb'),
            this.#gltfLoader.loadAsync('/models/Bot/Dance.glb'),
            this.#cubeLoader.loadAsync([
                '/textures/env/px.jpg',
                '/textures/env/nx.jpg',
                '/textures/env/py.jpg',
                '/textures/env/ny.jpg',
                '/textures/env/pz.jpg',
                '/textures/env/nz.jpg',
            ]),
            this.#fontLoader.loadAsync('/fonts/helvetiker_regular.typeface.json'),
        ])

        this.#font = font

        envMap.encoding = THREE.sRGBEncoding
        this.#enviroMat.envMap = envMap

        this.#thingGeo = {
            animations: {
                idle: idle.animations[0],
                run: run.animations[0],
                dance: dance.animations[0],
            },
            scene: run.scene,
        }

        this.#thingGeo.scene.traverse(child => {
            if (
                child instanceof THREE.Mesh &&
                child.material instanceof THREE.MeshStandardMaterial
            ) {
                child.material.envMap = envMap
                child.material.envMapIntensity = 2
                child.material.color.set(0xaa0000)
                child.material.metalness = 0.4
                child.material.roughness = 0.3

                child.castShadow = true
                child.receiveShadow = true
            }
        })

        return this
    }

    create = (type, options) =>
        ({
            thing: this.#thing(options),
            enviro: this.#enviro(options),
            plane: this.#plane(options),
            sceneText: this.#sceneText(options),
        }[type])

    #sceneText = options => {
        const shapes = this.#font.generateShapes(String(options.text), options.size)
        const geometry = new THREE.ShapeGeometry(shapes)
        geometry.computeBoundingBox()
        const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
        geometry.translate(xMid, 1, 0)
        const mesh = new THREE.Mesh(geometry, this.#textMat)
        return mesh
    }

    #thing = options => {
        const object = new THREE.Group()
        object.add(new THREE.AxesHelper())
        object.position.copy(options.position)
        object.quaternion.copy(options.rotation)

        const skin = SkeletonUtils.clone(this.#thingGeo.scene)
        skin.scale.set(20, 20, 20)
        skin.rotation.y = Math.PI

        object.add(skin)
        return { object, animations: this.#thingGeo.animations }
    }

    #enviro = options => {
        const mesh = new THREE.Mesh(this.#enviroGeo, this.#enviroMat)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.position.copy(options.position)
        mesh.quaternion.copy(options.rotation)
        return mesh
    }

    #plane = options => {
        const mesh = new THREE.Mesh(this.#planeGeo, this.#enviroMat)
        mesh.receiveShadow = true
        mesh.position.copy(options.position)
        mesh.quaternion.copy(options.rotation)
        mesh.scale.set(100, 100, 100)
        return mesh
    }

    characterPanel = options => {
        const element = document.createElement('div')
        element.style = 'width: 50px; text-align: center'

        const text = document.createElement('span')
        text.className = 'tag is-large'
        text.style.visibility = 'hidden'
        element.appendChild(text)

        const name = document.createElement('span')
        name.className = 'tag is-info'
        name.textContent = options.content
        element.appendChild(name)

        const panel = new CSS2DObject(element)
        panel.position.copy(options.position)
        panel.layers.set(1)
        return { panel, text, name }
    }

    userPanel = () => {
        const element = document.createElement('div')
        element.className = 'container box'
        element.style = 'opacity: 90%'

        const html = `
            <div class="columns">
                <div class="column">
                    <div class="field is-grouped">
                        <div class="control">
                            <div class="tags has-addons">
                                <span class="tag">Online</span>
                                <span class="tag is-success is-large" id="onlineCounter">0</span>
                            </div>
                        </div>
                        <div class="control is-expanded">
                            <input class="input" type="text" placeholder="text, name or /dance" id="text" />
                        </div>
                        <div class="control">
                            <button class="button is-danger" id="sendText">Text</button>
                            <button class="button is-info" id="sendName">Name</button>
                        </div>
                    </div>
                </div>
            </div>
            `

        element.innerHTML = html
        return element
    }
}

export const factory = await new Factory().loaded()
