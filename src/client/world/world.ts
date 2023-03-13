import * as THREE from 'three'
import { GUI } from 'dat.gui'

import { Flock } from './flock'

export class World {
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    gui: GUI

    flock: Flock

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer, gui: GUI) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.gui = gui

        this.flock = new Flock(60)
    }

    onStart() {
        this.flock.onStart(this)
    }

    onUpdate(delta: number) {
        this.flock.onUpdate(delta)
    }
}
