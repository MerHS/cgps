import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

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

const gui = new GUI()
const controls = new OrbitControls(camera, renderer.domElement)

controls.listenToKeyEvents(document.body)
controls.keys = {
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    UP: 'KeyW',
    BOTTOM: 'KeyS',
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

let clock = new THREE.Clock()
clock.start()

let world = new World(scene, camera, renderer, gui)

function matchGUI() {}

function animate() {
    // setInterval(() => , 1000 / 60)
    requestAnimationFrame(animate)

    const delta = clock.getDelta()

    world.onUpdate(delta)

    controls.update()
    stats.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}

world.onStart()
animate()
// render()
