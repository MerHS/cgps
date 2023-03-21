import * as THREE from 'three'
import { World } from './world'
import { DragControls } from 'three/examples/jsm/controls/DragControls'

const sphereGeo = new THREE.SphereGeometry(0.2)
const matcapMat = new THREE.MeshMatcapMaterial()
const redLight = new THREE.TextureLoader().load('matcap/matcap-crystal.png')
matcapMat.matcap = redLight

export class Obstacle {
    world: World
    control: DragControls
    mesh: THREE.Mesh

    constructor(world: World) {
        this.world = world
        this.mesh = new THREE.Mesh(sphereGeo, matcapMat)
        this.control = new DragControls([this.mesh], world.camera, world.renderer.domElement)

        this.control.addEventListener('dragstart', (_) => {
            world.control.enabled = false
        })

        this.control.addEventListener('dragend', (_) => {
            world.control.enabled = true
        })
    }

    onStart(world: World) {
        world.scene.add(this.mesh)
    }
}
