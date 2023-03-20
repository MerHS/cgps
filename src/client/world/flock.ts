import * as THREE from 'three'
import { World } from './world'
import { Bird } from './bird'
import { Vector3 } from 'three'

const coneGeo = new THREE.ConeGeometry(0.03, 0.1)
coneGeo.rotateX(Math.PI / 2)
const matcapMat = new THREE.MeshMatcapMaterial()
const redLight = new THREE.TextureLoader().load('matcap/matcap-gold.png')
matcapMat.matcap = redLight

interface FlockSetting {
    scale: number
    visualRange: number
    coherence: number
    separation: number
    alignment: number
}

export class Flock {
    world: World
    birds: Bird[]
    count: number
    center: Vector3
    vcenter: Vector3
    v1: Vector3
    v2: Vector3
    v3: Vector3
    del2: Vector3

    setting: FlockSetting

    constructor(count: number, world: World) {
        this.count = count
        this.birds = []
        this.world = world

        this.center = new Vector3()
        this.vcenter = new Vector3()
        this.v1 = new Vector3()
        this.v2 = new Vector3()
        this.v3 = new Vector3()
        this.del2 = new Vector3()

        this.setting = {
            scale: 1,
            visualRange: 1,
            coherence: 1,
            separation: 1,
            alignment: 1,
        }

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(coneGeo, matcapMat)
            const bird = new Bird(mesh)

            bird.mesh.position.set(
                2 * Math.random() - 1,
                2 * Math.random() - 1,
                2 * Math.random() - 1
            )
            bird.velocity.set(
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01
            )
            this.birds.push(bird)
        }
    }

    onStart(world: World) {
        this.birds.forEach((b) => b.onStart(world))

        const folder = world.gui.addFolder('Flock')
        folder.add(this.setting, 'scale', 0, 4)
        folder.add(this.setting, 'visualRange', 0, 3).step(0.02)
        folder.add(this.setting, 'coherence', 0, 5).step(0.02)
        folder.add(this.setting, 'separation', 0, 5).step(0.02)
        folder.add(this.setting, 'alignment', 0, 5).step(0.02)
        folder.open()
    }

    onUpdate(delta: number) {
        // scaling delta to 60FPS
        const predatorPos = this.world.predator.bird.mesh.position
        const deltaScale = delta / (1 / 60)

        const scale = 0.5 * this.setting.scale * deltaScale

        for (let bird of this.birds) {
            const pos = bird.mesh.position
            const neighbor: Bird[] = []

            this.v2.set(0, 0, 0)
            for (let birdNext of this.birds) {
                this.del2.subVectors(birdNext.mesh.position, pos)
                const dist = this.del2.length()
                if (dist < 0.1) {
                    this.v2.sub(this.del2)
                }

                if (dist < 0.22 * this.setting.visualRange) {
                    neighbor.push(birdNext)
                }
            }

            this.center.set(0, 0, 0)
            this.vcenter.set(0, 0, 0)
            for (let birdNext of neighbor) {
                this.center.add(birdNext.mesh.position)
                this.vcenter.add(birdNext.velocity)
            }

            if (neighbor.length >= 2) {
                this.v1.copy(this.center)
                this.v1.divideScalar(neighbor.length)
                this.v1.sub(pos)
                this.v1.multiplyScalar(scale * 0.03 * this.setting.coherence)

                this.v3.copy(this.vcenter)
                this.v3.divideScalar(neighbor.length)
                this.v3.sub(bird.velocity)
                this.v3.multiplyScalar(scale * 0.5 * this.setting.alignment)

                bird.velocity.add(this.v1)
                bird.velocity.add(this.v3)
            }

            this.v2.multiplyScalar(scale * 0.3 * this.setting.separation)
            bird.velocity.add(this.v2)

            this.v3.copy(pos)
            this.v3.sub(predatorPos)
            if (this.v3.length() < 0.5) {
                this.v3.normalize()
                this.v3.multiplyScalar(4 * (0.5 - this.v3.length()))
                bird.velocity.sub(this.v3)
            }

            // limit position
            if (pos.x < 0) {
                bird.velocity.x += 0.01
            } else if (pos.x > 2) {
                bird.velocity.x -= 0.01
            }

            if (pos.y < 0) {
                bird.velocity.y += 0.01
            } else if (pos.y > 2) {
                bird.velocity.y -= 0.01
            }

            if (pos.z < 0) {
                bird.velocity.z += 0.01
            } else if (pos.z > 2) {
                bird.velocity.z -= 0.01
            }

            // limit velocity
            if (bird.velocity.length() > 0.05) {
                bird.velocity.normalize()
                bird.velocity.multiplyScalar(0.05)
            }

            bird.onUpdate(delta)
        }
    }
}
