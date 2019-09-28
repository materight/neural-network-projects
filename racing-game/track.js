const extPoints = [[0, 0], [0, -100], [20, -180], [80, -260], [140, -280], [300, -240], [340, -240], [440, -280], [500, -290], [540, -240], [520, 0], [560, 200], [540, 260], [500, 280], [440, 260], [380, 140], [340, 0], [300, -20], [280, 10], [260, 200], [200, 280], [100, 260], [40, 140]]
const intPoints = [[60, 0], [60, -100], [80, -170], [100, -200], [130, -220], [280, -190], [340, -190], [470, -220], [450, 0], [490, 190], [380, -80], [290, -100], [210, 0], [200, 160], [170, 210], [130, 200]]
const checkpoints = [[-20, -40], [80, -40], [-10, -140], [80, -120], [40, -240], [110, -190], [180, -290], [160, -190], [270, -260], [240, -180], [326, -263], [330, -170], [385, -273], [402, -191], [453, -209], [447, -298], [457, -200], [556, -225], [450, -135], [538, -113], [437, -58], [547, -50], [446, 30], [541, 26], [459, 78], [553, 75], [465, 115], [568, 132], [469, 129], [565, 222], [471, 139], [518, 282], [461, 103], [406, 232], [450, 64], [352, 84], [415, -36], [332, 25], [345, -104], [314, 6], [237, -76], [297, 18], [192, 17], [294, 61], [187, 95], [286, 153], [171, 161], [247, 246], [157, 185], [158, 290], [135, 163], [77, 234], [111, 104], [19, 137], [84, 46], [-2, 52]]


class Track {
    constructor(x, y) {
        this.x = x
        this.y = y

        this.extPoints = []
        for (let p of extPoints) this.extPoints.push(createVector(this.x + p[0], this.y + p[1]))
        this.intPoints = []
        for (let p of intPoints) this.intPoints.push(createVector(this.x + p[0], this.y + p[1]))
        this.checkpoints = []
        for (let p of checkpoints) this.checkpoints.push(createVector(this.x + p[0], this.y + p[1]))
    }

    draw() {
        push()
        background('#8EC840')
        // Limite esterno
        fill('#282B2A ')
        stroke('#CE3B43')
        strokeWeight(6)
        beginShape()
        for (let p of this.extPoints) vertex(p.x, p.y)
        endShape(CLOSE)
        // Limite interno
        fill('#8EC840')
        beginShape()
        for (let p of this.intPoints) vertex(p.x, p.y)
        endShape(CLOSE)
        // Partenza
        noStroke()
        fill('#ffffff')
        rect(this.extPoints[0].x + 3, this.extPoints[0].y, this.intPoints[0].x - this.extPoints[0].x - 6, -15)
        // Checkpoints
        if (showCheckpoints) {
            stroke('#ff4')
            strokeWeight(4)
            for (let i = 0; i < this.checkpoints.length; i += 2) line(this.checkpoints[i].x, this.checkpoints[i].y, this.checkpoints[i + 1].x, this.checkpoints[i + 1].y)
        }
        pop()
    }

}

/**
 * Per inizializzare i checkpoints decommentare e usare il mouse
 */
/*
var newPoints = []
var start = null
function mouseClicked() {
    console.log("CLICK")
    if (start == null) {
        start = [mouseX - track.x, mouseY - track.y]
        console.log(start)
    } else {
        newPoints.push(start, [mouseX - track.x, mouseY - track.y])
        track.checkpoints.push(createVector(start[0] + track.x, start[1] + track.y))
        track.checkpoints.push(createVector(mouseX, mouseY))
        start = null

        let str = "["
        for (let i = 0; i < newPoints.length; i++) {
            str += "[" + newPoints[i][0] + "," + newPoints[i][1] + "],"
        }
        str += "]"
        console.log(str)
    }
}*/