import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

import { World } from './world/world'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(3))

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(5, 5, 5)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({
    antialias: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const stats = Stats()
document.body.appendChild(stats.dom)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

let clock = new THREE.Clock()
clock.start()

let world = new World(scene, camera, renderer)

function animate() {
    requestAnimationFrame(animate)

    let delta = clock.getDelta()
    // cap delta because of focus out
    if (delta > 0.1) {
        delta = 0.1
    }

    world.onUpdate(delta)
    stats.update()
    render()

    //     while (interval >= fixedDelta) {
    //         world.onUpdate(fixedDelta)
    //         controls.update()
    //         stats.update()
    //         render()
    //         interval -= fixedDelta
    //     }
}

function render() {
    renderer.render(scene, camera)
}

world.onStart()
animate()
