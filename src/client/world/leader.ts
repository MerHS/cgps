import * as THREE from 'three'
import { World } from './world'
import { DragControls } from 'three/examples/jsm/controls/DragControls'

const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const matcapMat = new THREE.MeshMatcapMaterial()
const redLight = new THREE.TextureLoader().load('matcap/matcap-opal.png')
matcapMat.matcap = redLight

export class Leader {
    world: World
    control: DragControls
    mesh: THREE.Mesh
    enabled: boolean

    constructor(world: World) {
        this.world = world
        matcapMat.opacity = 0.5
        this.mesh = new THREE.Mesh(boxGeo, matcapMat)
        this.control = new DragControls([this.mesh], world.camera, world.renderer.domElement)

        this.mesh.position.set(2, 2, 2)
        this.enabled = false

        this.control.addEventListener('dragstart', (e) => {
            e.object.material.opacity = 1
            world.control.enabled = false
            this.enabled = true
        })

        this.control.addEventListener('dragend', (e) => {
            e.object.material.opacity = 0.5
            world.control.enabled = true
            this.enabled = false
        })
    }

    onStart(world: World) {
        world.scene.add(this.mesh)
    }
}
