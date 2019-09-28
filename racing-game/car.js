const acceleration = 0.05
const drag = 0.9, angularDrag = 0.8 // Quanto la macchina rallenta
const maxVelocity = 7
const turnSpeed = Math.PI / 60


class Car {
    constructor(x, y, brainInstance) {
        this.width = 10
        this.height = 15
        this.x = x
        this.y = y
        this.direction = 0 // in radianti
        this.velocity = 0
        this.angularVelocity = 0
        this.nextCheckpoint = 0
        this.laps = 0
        this.inactiveTimer = millis()
        this.color = "#ff585d"

        this.fitness = 0
        this.brain = brainInstance
    }

    draw() {
        push()
        noStroke()
        fill(this.color)
        translate(this.x, this.y)
        rotate(this.direction)
        translate(-this.width / 2, -this.height / 2)
        rect(0, 0, this.width, this.height)
        fill('#000000')
        rect(-2, 1, 2, 4)
        rect(-2, this.height - 5, 2, 4)
        rect(this.width, 1, 2, 4)
        rect(this.width, this.height - 5, 2, 4)
        rect(1, 4, this.width - 2, 4)
        pop()
    }


    update() {
        this.x += (this.velocity) * sin(this.direction)
        this.y -= (this.velocity) * cos(this.direction)

        this.direction += this.angularVelocity * this.velocity * 0.1
        this.angularVelocity *= angularDrag

        let out = this.think()
        if (!manual) {
            if (out[0] > 0) {
                this.accelerate()
            } else {
                this.deccelerate()
            }

            if (out[1] > 0) {
                if (out[2] > 0) {
                    this.turnRight()
                } else {
                    this.turnLeft()
                }
            }
        }

        if (this.nextCheckpointCollided()) {
            this.inactiveTimer = millis()
            this.nextCheckpoint++
            if (this.nextCheckpoint >= track.checkpoints.length / 2) {
                this.nextCheckpoint = 0
                this.laps++
            }
        }
    }

    turnRight() {
        this.angularVelocity += turnSpeed
    }

    turnLeft() {
        this.angularVelocity -= turnSpeed
    }

    accelerate() {
        this.velocity += acceleration
        if (this.velocity > maxVelocity) this.velocity = maxVelocity
    }

    deccelerate() {
        this.velocity *= drag
        if (this.velocity < 0) this.velocity = 0
    }

    collided() {
        let result = collideRectPoly(this.x - this.height / 2, this.y - this.height / 2, this.height, this.height, track.intPoints) || collideRectPoly(this.x, this.y, this.width, this.width, track.extPoints)
        if (result) {
            // Se la macchina è morta, calcolo il valore del fitness
            this.fitness = this.calcFitness()
        }
        return result
    }

    think() {
        // Neuroni di inputs
        let dists = this.input()
        let velocity = this.velocity / maxVelocity

        let result = this.brain.feedForward(Matrix.from([[...dists, velocity]]))
        return result[0]
    }

    input() {
        let length = 1000
        let linesAngles = [-PI / 2, -PI / 4, 0, PI / 4, PI / 2]
        let value = new Array(linesAngles.length).fill(Infinity)
        let points = new Array(linesAngles.length)

        let calc = (trackPoints) => {
            for (let i = 0; i < linesAngles.length; i++) {
                let la = linesAngles[i]
                for (let t = 0; t < trackPoints.length; t++) {
                    let p1 = trackPoints[t]
                    let p2 = trackPoints[(t + 1) % trackPoints.length]
                    let intersection = collideLineLine(this.x, this.y, this.x + length * sin(this.direction + la), this.y - length * cos(this.direction + la), p1.x, p1.y, p2.x, p2.y, true)
                    if (intersection.x != false && intersection.y != false) {
                        let d = dist(intersection.x, intersection.y, this.x, this.y) / length
                        if (d < value[i]) {
                            value[i] = d
                            points[i] = intersection
                        }
                    }
                }
            }
        }

        calc(track.intPoints)
        calc(track.extPoints)

        if (showInputs) {
            for (let la of linesAngles) {
                stroke('#ffffff')
                line(this.x, this.y, this.x + length * sin(this.direction + la), this.y - length * cos(this.direction + la))
            }

            for (let p of points) {
                if (p) circle(p.x, p.y, 8)
            }
        }
        return value
    }

    nextCheckpointCollided() {
        let next = [track.checkpoints[this.nextCheckpoint * 2], track.checkpoints[this.nextCheckpoint * 2 + 1]]
        return collideLineRect(next[0].x, next[0].y, next[1].x, next[1].y, this.x - this.height / 2, this.y - this.height / 2, this.height, this.height)
    }

    nextCheckpointDistance() {
        let next = [track.checkpoints[this.nextCheckpoint * 2], track.checkpoints[this.nextCheckpoint * 2 + 1]]
        let midpoint = createVector((next[0].x + next[1].x) / 2, (next[0].y + next[1].y) / 2)
        return dist(midpoint.x, midpoint.y, this.x - this.width / 2, this.y - this.height / 2)
    }

    calcFitness() {
        let lapPoint = 10000
        let checkpointPoint = 100
        let nextDistance = this.nextCheckpointDistance()
        return this.laps * lapPoint + this.nextCheckpoint * checkpointPoint - nextDistance
    }

    reset() {
        this.x = startX
        this.y = startY
        this.direction = 0
        this.velocity = 0
        this.angularVelocity = 0
        this.best = false
        this.nextCheckpoint = 0
        this.fitness = 0
        this.inactiveTimer = millis()
        this.color = "#ff585d"
    }
}