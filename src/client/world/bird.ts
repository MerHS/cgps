import * as THREE from 'three'
import { World } from './world'

export class Bird {
    mesh: THREE.Mesh
    velocity: THREE.Vector3
    lookAtPos: THREE.Vector3
    scaleVelocity: THREE.Vector3

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh
        this.velocity = new THREE.Vector3()
        this.lookAtPos = new THREE.Vector3()
        this.scaleVelocity = new THREE.Vector3()
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
