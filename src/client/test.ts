import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Vector3 } from 'three'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer({
    antialias: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const stats = Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const cameraFolder = gui.addFolder('Camera')

let value = {
    theta: 0,
}
cameraFolder.add(value, 'theta', 0, 2 * Math.PI).listen()
cameraFolder.open()

const controls = new OrbitControls(camera, renderer.domElement)
// controls.addEventListener('change', matchGUI)

const geometry = new THREE.ConeGeometry()
const dotGeo = new THREE.SphereGeometry(0.1)
const boxGeo = new THREE.BoxGeometry()
geometry.scale(0.2, 1, 0.2)

const material = new THREE.MeshBasicMaterial()
const refracMaterial = new THREE.MeshBasicMaterial()
const matcapMat = new THREE.MeshMatcapMaterial()

const matcapTexture = new THREE.TextureLoader().load('matcap/matcap-red-light.png')
matcapMat.matcap = matcapTexture

const texture = new THREE.TextureLoader().load('img/grid.png')
// material.map = texture

const envTexture = new THREE.CubeTextureLoader().load([
    'img/px_50.png',
    'img/nx_50.png',
    'img/py_50.png',
    'img/ny_50.png',
    'img/pz_50.png',
    'img/nz_50.png',
])
const refracTexture = envTexture.clone()
envTexture.mapping = THREE.CubeReflectionMapping
refracTexture.mapping = THREE.CubeRefractionMapping
material.envMap = envTexture
refracMaterial.envMap = refracTexture
refracMaterial.refractionRatio = 0.2

const cone = new THREE.Mesh(geometry, matcapMat)
const dot = new THREE.Mesh(dotGeo, material)
const cube = new THREE.Mesh(dotGeo, matcapMat)
const cube2 = new THREE.Mesh(dotGeo, refracMaterial)
scene.add(cone)
cone.add(dot)
scene.add(cube)
scene.add(cube2)
cube.scale.set(5, 5, 5)
cube2.translateX(2)
cube2.scale.set(5, 5, 5)

const dragControls = new DragControls([cube, cube2], camera, renderer.domElement)
dragControls.addEventListener('dragstart', (e) => {
    controls.enabled = false
})
dragControls.addEventListener('dragend', (e) => {
    controls.enabled = true
})

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

let clock = new THREE.Clock()
clock.start()

function matchGUI() {}

function animate() {
    requestAnimationFrame(animate)
    const d = clock.getDelta()

    let theta = value.theta
    value.theta = (theta + d) % (2 * Math.PI)
    theta = value.theta

    cone.position.x = 3 * Math.sin(theta)
    cone.position.y = 3 * Math.cos(theta)

    cone.rotation.z = -Math.PI / 2 - theta

    controls.update()
    stats.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}
animate()
// render()
