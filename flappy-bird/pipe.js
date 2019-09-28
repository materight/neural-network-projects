class Pipe {
    constructor(initialShift) {
        this.width = 100
        this.minHeight = 60
        this.holeHeight = 180
        this.speed = 2

        this.passed = false
        this.x = canvas.width + initialShift
        this.y = 0
        this.upperHeight = floor(random() * (canvas.height - (2 * this.minHeight + this.holeHeight)) + this.minHeight)
    }

    display() {
        push()
        translate(this.x + this.width, this.upperHeight)
        rotate(180)
        image(pipeImg, 0, 0)
        translate(this.width, -this.holeHeight)
        rotate(180)
        image(pipeImg, 0, 0)
        pop()
    }

    update() {
        this.x -= this.speed * speedMultiplier
        if (this.x < 0 - this.width) {
            this.passed = false
            this.x = canvas.width
            this.upperHeight = Math.floor(Math.random() * (canvas.height - (2 * this.minHeight + this.holeHeight)) + this.minHeight)
        }
    }

}