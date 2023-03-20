import * as THREE from 'three'
import { GUI } from 'dat.gui'

import { Flock } from './flock'
import { Predator } from './predator'
export class World {
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    gui: GUI

    flock: Flock
    predator: Predator

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer, gui: GUI) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.gui = gui

        this.flock = new Flock(200, this)
        this.predator = new Predator(this)
    }

    onStart() {
        this.predator.onStart(this)
        this.flock.onStart(this)
    }

    onUpdate(delta: number) {
        this.predator.onUpdate(delta)
        this.flock.onUpdate(delta)
    }
}
