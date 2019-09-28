const manual = false
const showInputs = false
const showCheckpoints = false

var startX, startY
var population
var track
var generation

function setup() {
    canvas = createCanvas(640, 640)
    startX = 50
    startY = canvas.height / 2
    population = new Population(startX, startY)
    track = new Track(startX - 30, startY)
    generation = 0
}

function draw() {

    track.draw()

    population.update()
    population.collide()

    population.draw()

    if (population.allCrashed()) {
        population.mutate()
        generation++
    }

    textSize(30)
    fill(255)
    text("Gen: " + generation, 10, 30)

    control()
}

function control() {
    if (manual) {
        if (keyIsDown(UP_ARROW)) {
            this.population.active[0].accelerate()
        } else {
            this.population.active[0].deccelerate()
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.population.active[0].turnLeft()
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.population.active[0].turnRight()
        }
    }
}