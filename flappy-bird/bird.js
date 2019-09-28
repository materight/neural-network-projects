class Bird {
    constructor(x, y) {
        this.width = 58
        this.height = 40
        this.jumpSpeed = 10

        this.best = false
        this.tint = color(random(255), random(255), random(255))
        this.x = x
        this.y = y
        this.speed = 0
        this.fitness = 0
        this.timerStart = 0
        this.brain = new NeuralNetwork(4, 6, 1)
    }

    display() {
        push()
        imageMode(CENTER)
        translate(this.x + this.width / 2, this.y + this.height / 2)
        rotate(this.speed * 2)
        //tint(this.tint)
        if (this.best) tint(color('red'))
        image(birdImg, 0, 0, this.width, this.height)
        pop()
    }

    update() {
        this.speed += gravity * speedMultiplier
        this.y += this.speed * speedMultiplier
        if (this.y < 0) {
            this.y = 0
            this.speed = 0
        }
        this.fitness += pipes[0].speed * speedMultiplier
        if (this.think()) {
            this.jump()
        }
    }

    normalize(value, max) {
        return (2 * (value / max)) - 1
    }

    think() {
        let nearestPipe = pipes.reduce((prev, curr) => (curr.x < prev.x && curr.x + curr.width > this.x) ? curr : prev)

        // Neuroni di inputs
        let height = this.normalize(canvas.height - this.y, canvas.height)  // Altezza da terra
        let pipeDistance = this.normalize(this.x - nearestPipe.x, canvas.width)
        let topDistance = this.normalize(this.y - nearestPipe.upperHeight, canvas.height)
        let bottomDistance = this.normalize(this.y - (nearestPipe.upperHeight + nearestPipe.holeHeight), canvas.height)

        let input = Matrix.from([[height, pipeDistance, topDistance, bottomDistance]]);
        let result = this.brain.feedForward(input)
        return result[0][0] > 0
    }

    jump() {
        this.speed = -this.jumpSpeed
    }

    collided() {
        if (this.y + this.height > canvas.height) {
            return true
        }

        for (let p of pipes) {
            if (this.x < p.x + p.width && this.x + this.width > p.x &&
                (this.y < p.upperHeight || this.y + this.height > p.upperHeight + p.holeHeight)) {
                return true
            }
        }
        return false
    }

    reset() {
        this.y = canvas.height / 2
        this.speed = 0
        this.fitness = 0
        this.timerStart = 0
        this.best = false
    }
}