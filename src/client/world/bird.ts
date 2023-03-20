import * as THREE from 'three'
import { World } from './world'

const coneGeo = new THREE.ConeGeometry(0.03, 0.1)
coneGeo.rotateX(Math.PI / 2)
const matcapMat = new THREE.MeshMatcapMaterial()
const redLight = new THREE.TextureLoader().load('matcap/matcap-red-light.png')
matcapMat.matcap = redLight

export class Bird {
    mesh: THREE.Mesh
    velocity: THREE.Vector3
    lookAtPos: THREE.Vector3
    scaleVelocity: THREE.Vector3

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.mesh = new THREE.Mesh(coneGeo, matcapMat)
        this.velocity = new THREE.Vector3()
        this.lookAtPos = new THREE.Vector3()
        this.scaleVelocity = new THREE.Vector3()

        this.mesh.position.x = x
        this.mesh.position.y = y
        this.mesh.position.z = z
    }

    onStart(world: World) {
        world.scene.add(this.mesh)
    }

    onUpdate(delta: number) {
        // scaling delta to 60FPS
        const deltaScale = delta / (1 / 60)

        this.lookAtPos.copy(this.mesh.position)
        this.lookAtPos.add(this.velocity)
        this.mesh.lookAt(this.lookAtPos)

        this.scaleVelocity.copy(this.velocity)
        this.scaleVelocity.multiplyScalar(deltaScale)
        this.mesh.position.add(this.scaleVelocity)
    }
}
