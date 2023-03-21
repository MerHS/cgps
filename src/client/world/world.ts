import * as THREE from 'three'
import { GUI } from 'dat.gui'

import { Flock } from './flock'
import { Predator } from './predator'
import { Obstacle } from './obstacle'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
export class World {
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    gui: GUI
    control: OrbitControls

    flock: Flock
    predator: Predator
    obstacles: Obstacle[]

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.gui = new GUI()
        this.control = new OrbitControls(camera, renderer.domElement)

        this.flock = new Flock(200, this)
        this.predator = new Predator(this)
        this.obstacles = [new Obstacle(this)]
    }

    onStart() {
        this.predator.onStart(this)
        this.flock.onStart(this)
        for (let obs of this.obstacles) {
            obs.onStart(this)
        }
    }

    onUpdate(delta: number) {
        this.predator.onUpdate(delta)
        this.flock.onUpdate(delta)

        this.control.update()
    }
}
