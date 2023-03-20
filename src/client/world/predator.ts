import * as THREE from 'three'
import { Bird } from './bird'
import { World } from './world'

const coneGeo = new THREE.ConeGeometry(0.05, 0.2)
coneGeo.rotateX(Math.PI / 2)
const matcapMat = new THREE.MeshMatcapMaterial()
const redLight = new THREE.TextureLoader().load('matcap/matcap-red-light.png')
matcapMat.matcap = redLight

export class Predator {
    world: World
    bird: Bird
    delta: THREE.Vector3

    constructor(world: World) {
        this.world = world
        const predatorMesh = new THREE.Mesh(coneGeo, matcapMat)

        this.bird = new Bird(predatorMesh)
        this.delta = new THREE.Vector3()

        this.bird.mesh.position.set(
            2 * Math.random() - 1,
            2 * Math.random() - 1,
            2 * Math.random() - 1
        )
        this.bird.velocity.set(
            0.02 * Math.random() - 0.01,
            0.02 * Math.random() - 0.01,
            0.02 * Math.random() - 0.01
        )
    }

    onStart(world: World) {
        this.bird.onStart(world)
    }

    onUpdate(delta: number) {
        const pos = this.bird.mesh.position

        const neighbor: Bird[] = []
        for (let food of this.world.flock.birds) {
            this.delta.subVectors(food.mesh.position, pos)
            const dist = this.delta.length()
            if (dist < 0.8) {
                neighbor.push(food)
            }
        }

        this.delta.set(0, 0, 0)
        for (let food of neighbor) {
            this.delta.add(food.mesh.position)
        }

        if (neighbor.length >= 1) {
            this.delta.divideScalar(neighbor.length)
            this.delta.sub(pos)
            this.delta.multiplyScalar(0.02)
            this.bird.velocity.add(this.delta)
        }

        if (pos.x < 0) {
            this.bird.velocity.x += 0.002
        } else if (pos.x > 2) {
            this.bird.velocity.x -= 0.002
        }

        if (pos.y < 0) {
            this.bird.velocity.y += 0.002
        } else if (pos.y > 2) {
            this.bird.velocity.y -= 0.002
        }

        if (pos.z < 0) {
            this.bird.velocity.z += 0.002
        } else if (pos.z > 2) {
            this.bird.velocity.z -= 0.002
        }

        if (this.bird.velocity.length() > 0.05) {
            this.bird.velocity.normalize()
            this.bird.velocity.multiplyScalar(0.05)
        }

        this.bird.onUpdate(delta)
    }
}
