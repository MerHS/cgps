import * as THREE from 'three'
import { GUI } from 'dat.gui'

import { Flock } from './flock'
import { Predator } from './predator'
import { Obstacle } from './obstacle'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Leader } from './leader'

const boxGeo = new THREE.BoxGeometry(1, 1, 1)
const basicMat = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.3 })

export class World {
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    gui: GUI
    control: OrbitControls

    flock: Flock
    flockSize: number
    predator: Predator
    obstacles: Obstacle[]
    leader: Leader

    boundary: number
    boundingBox: THREE.Mesh

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.gui = new GUI()
        this.control = new OrbitControls(camera, renderer.domElement)

        this.boundary = 2
        this.boundingBox = new THREE.Mesh(boxGeo, basicMat)
        this.boundingBox.scale.set(this.boundary + 0.3, this.boundary + 0.3, this.boundary + 0.3)
        this.boundingBox.position.set(this.boundary / 2, this.boundary / 2, this.boundary / 2)

        this.flockSize = 100
        this.flock = new Flock(this.flockSize, this)
        this.predator = new Predator(this)
        this.obstacles = [new Obstacle(this)]
        this.leader = new Leader(this)
    }

    onStart() {
        this.predator.onStart(this)
        this.flock.onStart(this)
        for (let obs of this.obstacles) {
            obs.onStart(this)
        }
        this.leader.onStart(this)

        this.scene.add(this.boundingBox)

        this.gui.add(this, 'flockSize', 30, 2000).onChange((v) => {
            this.flock.resetSize(v)
        })

        this.gui.add(this, 'boundary', 1, 10).onChange((v) => {
            this.boundingBox.scale.set(v + 0.3, v + 0.3, v + 0.3)
            this.boundingBox.position.set(v / 2, v / 2, v / 2)
        })
    }

    onUpdate(delta: number) {
        this.predator.onUpdate(delta)
        this.flock.onUpdate(delta)

        this.control.update()
    }
}
