import * as THREE from 'three'
import { Vector3, Quaternion } from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { factory } from './Factory.js'

class Scene {
    #scene = undefined
    #camera = undefined
    #renderer = undefined
    #labelRenderer = undefined

    #fog = undefined
    #clearColor = 0xdcc9b6

    add = obj => {
        this.#scene.add(obj)
    }

    remove = obj => {
        this.#scene.remove(obj)
    }

    update = () => {
        this.#renderer.render(this.#scene, this.#camera)
        this.#labelRenderer.render(this.#scene, this.#camera)
    }

    resize = () => {
        this.#camera.aspect = window.innerWidth / window.innerHeight
        this.#camera.updateProjectionMatrix()

        this.#updateRenderer()
    }

    // TODO: intermediate damping object #target
    setTarget = player => {
        this.#camera.position //
            .copy(player.position)
            .add(new Vector3(0, 1, 2))

        this.#camera.lookAt(player.position)

        this.#camera.position //
            .add(new Vector3(0, 1, 0))

        player.add(this.#camera)
    }

    constructor() {
        this.#scene = new THREE.Scene()

        this.#addEnviro()
        this.#addCamera()
        this.#addRenderer()
        this.#addLight()
        // this.#addFog()
    }

    #addEnviro = () => {
        for (let i = 0; i < 100; i++) {
            const cube = factory.create('enviro', {
                position: new Vector3(
                    (Math.random() - 0.5) * 35,
                    (Math.random() - 0.5) * 5 + 2.5,
                    (Math.random() - 0.5) * 35
                ),
                rotation: new Quaternion().random(),
            })

            cube.scale.set(
                Math.max(Math.random() * 2, 0.3),
                Math.max(Math.random() * 2, 0.3),
                Math.max(Math.random() * 2, 0.3)
            )

            this.add(cube)
        }

        const plane = factory.create('plane', {
            position: new Vector3(),
            rotation: new Quaternion(),
        })

        plane.rotation.x = -Math.PI * 0.5
        this.add(plane)

        const text = factory.create('sceneText', {
            position: new Vector3(),
            rotation: new Quaternion(),
            text: '#',
            size: 0.5,
        })
        this.add(text)
    }

    #addCamera = () => {
        this.#camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.075,
            75
        )
        this.#camera.layers.enableAll()
        this.add(this.#camera)
    }

    #addRenderer = () => {
        this.#labelRenderer = new CSS2DRenderer()
        this.#labelRenderer.domElement.className = 'renderer'
        document.body.appendChild(this.#labelRenderer.domElement)

        this.#renderer = new THREE.WebGLRenderer()
        this.#renderer.setClearColor(this.#clearColor)
        this.#renderer.shadowMap.enabled = true
        // this.#renderer.physicallyCorrectLights = true
        this.#renderer.outputEncoding = THREE.sRGBEncoding
        this.#renderer.toneMapping = THREE.ACESFilmicToneMapping
        // this.#renderer.toneMappingExposure = 3
        this.#renderer.domElement.className = 'renderer'
        document.body.appendChild(this.#renderer.domElement)

        this.#updateRenderer()
    }

    #updateRenderer = () => {
        this.#renderer.setSize(window.innerWidth, window.innerHeight)
        // this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.#labelRenderer.setSize(window.innerWidth, window.innerHeight)
    }

    #addLight = () => {
        const amb = new THREE.AmbientLight(0xffffff, 0.35)
        this.add(amb)

        const dirLight = new THREE.DirectionalLight('#ffffff', 1)
        dirLight.castShadow = true
        // dirLight.shadow.camera.far = 15
        // dirLight.shadow.mapSize.set(2048, 2048)
        dirLight.shadow.normalBias = 0.05
        dirLight.position.set(10, 30, -10)
        const side = 16
        dirLight.shadow.camera.top = side
        dirLight.shadow.camera.bottom = -side
        dirLight.shadow.camera.left = side
        dirLight.shadow.camera.right = -side
        // dirLight.shadow.radius = 2
        this.add(dirLight)

        const helper = new THREE.CameraHelper(dirLight.shadow.camera)
        this.add(helper)
    }

    #addFog = () => {
        this.#fog = new THREE.Fog(this.#clearColor, 1, 55)
        this.#scene.fog = this.#fog
    }

    // TODO: Destruction disposes
}

export const scene = new Scene()
