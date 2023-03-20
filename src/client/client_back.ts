import { Vector3 } from 'three'

// Size of canvas. These get updated to fill the whole browser.
let width = 150
let height = 150

const numBoids = 100
const visualRange = 75

interface Boid {
    pos: Vector3
    vel: Vector3
    history: Vector3[]
}

var boids: Boid[] = []

function initBoids() {
    for (var i = 0; i < numBoids; i += 1) {
        let boid: Boid = {
            pos: new Vector3(Math.random() * width, Math.random() * height, 0),
            vel: new Vector3(Math.random() * width, Math.random() * height, 0),
            history: [],
        }

        boids[boids.length] = boid
    }
}

function distance(boid1: Boid, boid2: Boid) {
    return Math.sqrt(
        (boid1.pos.x - boid2.pos.x) * (boid1.pos.x - boid2.pos.x) +
            (boid1.pos.y - boid2.pos.y) * (boid1.pos.y - boid2.pos.y)
    )
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
    const canvas = document.getElementById('boids') as HTMLCanvasElement
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid: Boid) {
    const margin = 20
    const turnFactor = 1

    if (boid.pos.x < margin) {
        boid.vel.x += turnFactor
    }
    if (boid.pos.x > width - margin) {
        boid.vel.x -= turnFactor
    }
    if (boid.pos.y < margin) {
        boid.vel.y += turnFactor
    }
    if (boid.pos.y > height - margin) {
        boid.vel.y -= turnFactor
    }
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid: Boid) {
    const centeringFactor = 0.005 // adjust velocity by this %

    // let centerX = 0
    // let centerY = 0
    // let numNeighbors = 0

    // for (let otherBoid of boids) {
    //     if (distance(boid, otherBoid) < visualRange) {
    //         centerX += otherBoid.pos.x
    //         centerY += otherBoid.pos.y
    //         numNeighbors += 1
    //     }
    // }

    // if (numNeighbors) {
    //     centerX = centerX / numNeighbors
    //     centerY = centerY / numNeighbors

    //     boid.vel.x += (centerX - boid.pos.x) * centeringFactor
    //     boid.vel.y += (centerY - boid.pos.y) * centeringFactor
    // }

    let del2 = new Vector3(0, 0, 0)
    let neighbor: Boid[] = []

    for (let birdNext of boids) {
        del2.subVectors(birdNext.pos, boid.pos)
        const dist = del2.length()
        if (dist < visualRange) {
            neighbor.push(birdNext)
        }
    }

    let center = new Vector3(0, 0, 0)
    for (let birdNext of neighbor) {
        center.add(birdNext.pos)
    }

    let v1 = center.clone()
    if (neighbor.length >= 2) {
        v1.divideScalar(neighbor.length)
        v1.sub(boid.pos)
        v1.multiplyScalar(centeringFactor)

        boid.vel.add(v1)
    }
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid: Boid) {
    const minDistance = 20 // The distance to stay away from other boids
    const avoidFactor = 0.05 // Adjust velocity by this %
    let x = 1
    if (x == 0) {
        let moveX = 0
        let moveY = 0
        for (let otherBoid of boids) {
            if (otherBoid !== boid) {
                if (distance(boid, otherBoid) < minDistance) {
                    moveX += boid.pos.x - otherBoid.pos.x
                    moveY += boid.pos.y - otherBoid.pos.y
                }
            }
        }

        boid.vel.x += moveX * avoidFactor
        boid.vel.y += moveY * avoidFactor
    } else {
        let v2 = new Vector3(0, 0, 0)
        let del2 = new Vector3(0, 0, 0)
        for (let next of boids) {
            del2.subVectors(next.pos, boid.pos)
            const dist = del2.length()
            if (dist < minDistance) {
                v2.sub(del2)
            }
        }

        v2.multiplyScalar(avoidFactor)
        boid.vel.add(v2)
    }
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid: Boid) {
    const matchingFactor = 0.05 // Adjust by this % of average velocity

    // let avgDX = 0
    // let avgDY = 0
    // let numNeighbors = 0

    // for (let otherBoid of boids) {
    //     if (distance(boid, otherBoid) < visualRange) {
    //         avgDX += otherBoid.vel.x
    //         avgDY += otherBoid.vel.y
    //         numNeighbors += 1
    //     }
    // }

    // if (numNeighbors) {
    //     avgDX = avgDX / numNeighbors
    //     avgDY = avgDY / numNeighbors

    //     boid.vel.x += (avgDX - boid.vel.x) * matchingFactor
    //     boid.vel.y += (avgDY - boid.vel.y) * matchingFactor
    // }

    let del2 = new Vector3(0, 0, 0)
    let neighbor: Boid[] = []

    for (let birdNext of boids) {
        del2.subVectors(birdNext.pos, boid.pos)
        const dist = del2.length()
        if (dist < visualRange) {
            neighbor.push(birdNext)
        }
    }

    let vcenter = new Vector3(0, 0, 0)
    for (let next of neighbor) {
        vcenter.add(next.vel)
    }

    let v3 = vcenter.clone()
    if (neighbor.length >= 2) {
        v3.divideScalar(neighbor.length)
        v3.sub(boid.vel)
        v3.multiplyScalar(matchingFactor)

        boid.vel.add(v3)
    }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid: Boid) {
    const speedLimit = 15

    const speed = Math.sqrt(boid.vel.x * boid.vel.x + boid.vel.y * boid.vel.y)
    if (speed > speedLimit) {
        boid.vel.x = (boid.vel.x / speed) * speedLimit
        boid.vel.y = (boid.vel.y / speed) * speedLimit
    }
}

const DRAW_TRAIL = false

function drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
    const angle = Math.atan2(boid.vel.y, boid.vel.x)
    ctx.translate(boid.pos.x, boid.pos.y)
    ctx.rotate(angle)
    ctx.translate(-boid.pos.x, -boid.pos.y)
    ctx.fillStyle = '#558cf4'
    ctx.beginPath()
    ctx.moveTo(boid.pos.x, boid.pos.y)
    ctx.lineTo(boid.pos.x - 15, boid.pos.y + 5)
    ctx.lineTo(boid.pos.x - 15, boid.pos.y - 5)
    ctx.lineTo(boid.pos.x, boid.pos.y)
    ctx.fill()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

// Main animation loop
function animationLoop() {
    // Update each boid
    for (let boid of boids) {
        // Update the velocities according to each rule
        flyTowardsCenter(boid)
        avoidOthers(boid)
        matchVelocity(boid)
        limitSpeed(boid)
        keepWithinBounds(boid)

        // Update the position based on the current velocity
        boid.pos.x += boid.vel.x
        boid.pos.y += boid.vel.y
        boid.history.push(boid.pos)
        boid.history = boid.history.slice(-50)
    }

    // Clear the canvas and redraw all the boids in their current positions
    const ctx = (document.getElementById('boids') as HTMLCanvasElement).getContext('2d')!
    ctx.clearRect(0, 0, width, height)
    for (let boid of boids) {
        drawBoid(ctx, boid)
    }

    // Schedule the next frame
    window.requestAnimationFrame(animationLoop)
}

window.onload = () => {
    // Make sure the canvas always fills the whole window
    window.addEventListener('resize', sizeCanvas, false)
    sizeCanvas()

    // Randomly distribute the boids to start
    initBoids()

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop)
}
