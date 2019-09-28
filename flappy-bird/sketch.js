const gravity = 0.6

var birdImg, pipeImg

var speedMultiplier = 1
var canvas
var population
var pipes

var points, bestPoints
var generation

function preload() {
    birdImg = loadImage('img/bird.png')
    pipeImg = loadImage('img/pipe.png')
}

function setup() {
    canvas = createCanvas(600, 640)
    noSmooth()
    angleMode(DEGREES)
    reset()
    generation = 1
    bestPoints = 0
}

function reset() {
    if (!population) {
        population = new Population()
    } else {
        population.mutate()
    }
    pipes = [new Pipe(0), new Pipe((canvas.width + 100) / 2)]
    points = 0
    generation++
}

function draw() {
    background(77, 188, 253)

    population.update()
    for (let p of pipes) {
        p.update()
        if (p.x + p.width / 2 < 100 && !p.passed) {
            p.passed = true
            points++
            bestPoints = max(points, bestPoints)
        }
    }

    population.display()
    for (let p of pipes) p.display()

    textSize(20)
    noStroke()
    fill(255)
    text(points, 10, 20)
    text('GEN: ' + generation, canvas.width - 100, 20)
    text('BEST: ' + bestPoints, 10, canvas.height - 10)
    text('ACTIVE: ' + this.population.activeBirds.length, canvas.width - 130, canvas.height - 10)

    population.collide()
    if (population.allDied()) {
        reset()
    }
}

function keyPressed() {
    switch (key) {
        case ' ':
            //population.activeBirds[0].jump()
            break;
        case 'f': //speed up frame rate
            speedMultiplier += 0.2
            break;
        case 's': //slow down frame rate
            if (speedMultiplier > 1) speedMultiplier -= 0.2;
            break;
    }
}