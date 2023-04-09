import * as THREE from 'three'
import { World } from './world'
import { Bird } from './bird'
import { Vector3 } from 'three'
import { KDTree } from '../algorithm/kdtree'

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
    useKD: boolean

    setting: FlockSetting
    frameWeight: number
    frameCnt: number

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
        this.useKD = false

        this.frameWeight = 0
        this.frameCnt = 0

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
                3 * Math.random() + 1,
                3 * Math.random() + 1,
                3 * Math.random() + 1
            )
            bird.velocity.set(
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01
            )
            this.birds.push(bird)
        }
    }

    resetSize(size: number) {
        for (let bird of this.birds) {
            bird.mesh.geometry.dispose()
            // bird.mesh.material.dispose()
            ;(bird.mesh.material as THREE.Material).dispose()
            bird.mesh.remove()
            this.world.scene.remove(bird.mesh)
        }

        this.birds = []
        for (let i = 0; i < size; i++) {
            const mesh = new THREE.Mesh(coneGeo, matcapMat)
            const bird = new Bird(mesh)
            const bound = this.world.boundary

            bird.mesh.position.set(
                (bound - 0.2) * Math.random() + 0.2,
                (bound - 0.2) * Math.random() + 0.2,
                (bound - 0.2) * Math.random() + 0.2
            )
            bird.velocity.set(
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01,
                0.02 * Math.random() - 0.01
            )
            this.birds.push(bird)
        }
        this.birds.forEach((b) => b.onStart(this.world))
    }

    onStart(world: World) {
        this.birds.forEach((b) => b.onStart(world))

        const folder = world.gui.addFolder('Flock')
        folder.add(this.setting, 'scale', 0, 4)
        folder.add(this.setting, 'visualRange', 0, 3).step(0.02)
        folder.add(this.setting, 'coherence', 0, 5).step(0.02)
        folder.add(this.setting, 'separation', 0, 5).step(0.02)
        folder.add(this.setting, 'alignment', 0, 5).step(0.02)
        folder.add(this, 'useKD')
        folder.open()
    }

    onUpdate(delta: number) {
        // scaling delta to 60FPS
        const predatorPos = this.world.predator.bird.mesh.position
        const deltaScale = delta / (1 / 60)

        const scale = 0.5 * this.setting.scale * deltaScale
        const bound = this.world.boundary

        let startTime = Date.now()
        let kdTree: KDTree
        if (this.useKD) {
            kdTree = new KDTree()
            this.birds.forEach((bird, idx) => {
                kdTree.insert(bird.mesh.position, idx)
            })
        }

        for (let bird of this.birds) {
            const pos = bird.mesh.position
            const neighbor: Bird[] = []

            this.v2.set(0, 0, 0)

            if (this.useKD) {
                const d2Idx = kdTree!.query(pos, 0.1)
                const neighborIdx = kdTree!.query(pos, 0.22 * this.setting.visualRange)

                for (let idx of d2Idx) {
                    const birdNext = this.birds[idx]
                    this.del2.subVectors(birdNext.mesh.position, pos)
                    const dist = this.del2.length()
                    if (dist < 0.1) {
                        this.v2.sub(this.del2)
                    }
                }

                for (let idx of neighborIdx) {
                    neighbor.push(this.birds[idx])
                }
            } else {
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
                this.v3.multiplyScalar(scale * 0.7 * this.setting.alignment)

                bird.velocity.add(this.v1)
                bird.velocity.add(this.v3)
            }

            this.v2.multiplyScalar(scale * 0.3 * this.setting.separation)
            bird.velocity.add(this.v2)

            // 4. follow the leader
            if (this.world.leader.enabled) {
                this.v3.copy(this.world.leader.mesh.position)
                this.v3.sub(pos)
                this.v3.normalize()
                this.v3.multiplyScalar(0.2)
                bird.velocity.add(this.v3)
            }

            // 5. avoid obstacle
            for (let obstacle of this.world.obstacles) {
                this.v3.copy(pos)
                this.v3.sub(obstacle.mesh.position)
                if (this.v3.length() < 0.5) {
                    this.v3.normalize()
                    this.v3.multiplyScalar(4 * (0.5 - this.v3.length()))
                    bird.velocity.sub(this.v3)
                }
            }

            // 6. avoid predator
            this.v3.copy(pos)
            this.v3.sub(predatorPos)
            if (this.v3.length() < 0.5) {
                this.v3.normalize()
                this.v3.multiplyScalar(4 * (0.5 - this.v3.length()))
                bird.velocity.sub(this.v3)
            }

            // limit position
            if (pos.x < 0.1) {
                if (pos.x < 0 && bird.velocity.x < 0) {
                    bird.velocity.x = 0.02 - bird.velocity.x
                } else {
                    bird.velocity.x += 0.05 * (1 - pos.x)
                }
            } else if (pos.x > bound - 0.1) {
                if (pos.x > bound && bird.velocity.x > 0) {
                    bird.velocity.x = -0.02 - bird.velocity.x
                } else {
                    bird.velocity.x -= 0.05 * (1 + pos.x - bound)
                }
            }

            if (pos.y < 0.1) {
                if (pos.y < 0 && bird.velocity.y < 0) {
                    bird.velocity.y = 0.02 - bird.velocity.y
                } else {
                    bird.velocity.y += 0.05 * (1 - pos.y)
                }
            } else if (pos.y > bound - 0.1) {
                if (pos.y > bound && bird.velocity.y > 0) {
                    bird.velocity.y = -0.02 - bird.velocity.y
                } else {
                    bird.velocity.y -= 0.05 * (1 + pos.y - bound)
                }
            }

            if (pos.z < 0.1) {
                if (pos.z < 0 && bird.velocity.z < 0) {
                    bird.velocity.z = 0.02 - bird.velocity.z
                } else {
                    bird.velocity.z += 0.05 * (1 - pos.z)
                }
            } else if (pos.z > bound - 0.1) {
                if (pos.z > bound && bird.velocity.z > 0) {
                    bird.velocity.z = -0.02 - bird.velocity.z
                } else {
                    bird.velocity.z -= 0.05 * (1 + pos.z - bound)
                }
            }

            // limit velocity
            if (bird.velocity.length() > 0.05) {
                bird.velocity.normalize()
                bird.velocity.multiplyScalar(0.05)
            }

            bird.onUpdate(delta)
        }
        // console.log('loop', Date.now() - startTime)

        this.frameWeight += Date.now() - startTime
        this.frameCnt += 1

        if (this.frameCnt >= 30) {
            const meanMS = this.frameWeight / this.frameCnt
            console.log(
                'mean latency: ',
                meanMS.toFixed(3) + 'ms, fps: ',
                (1000 / meanMS).toFixed(3)
            )
            this.frameCnt = 0
            this.frameWeight = 0
        }
    }
}
