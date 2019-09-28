const birdsCount = 100

class Population {
    constructor() {
        this.count = birdsCount
        this.activeBirds = []
        this.diedBirds = []

        for (let i = 0; i < this.count; i++) {
            this.activeBirds[i] = new Bird(100, canvas.height / 2)
        }
    }

    display() {
        for (let b of this.activeBirds) {
            b.display()
        }
    }

    update() {
        for (let b of this.activeBirds) {
            b.update()
        }
    }

    collide() {
        // Rimozione birds morti
        for (let i = this.activeBirds.length - 1; i >= 0; i--) {
            if (this.activeBirds[i].collided()) {
                let nearestPipe = pipes.reduce((prev, curr) => (curr.x < prev.x && curr.x + curr.width > this.activeBirds[i].x) ? curr : prev)
                let centerDistance = Math.abs((this.activeBirds[i].y + this.activeBirds[i].height / 2) - (nearestPipe.upperHeight + nearestPipe.holeHeight / 2))
                this.activeBirds[i].fitness -= centerDistance * 0.1 // Per differenziare i bird che muoiono alla stessa distanza

                this.diedBirds.push(this.activeBirds[i])
                this.activeBirds.splice(i, 1)
            }
        }
    }

    allDied() {
        return this.activeBirds.length == 0
    }

    mutate() {
        this.diedBirds.sort((a, b) => a.fitness > b.fitness ? -1 : 1)
        console.log("Best fitness: ", this.diedBirds[0].fitness)

        let mutationRate = 0.01
        const top = 0.4
        const group1 = 0.8
        const group2 = 0.9

        if (this.diedBirds.every(x => x.fitness < 320)) {
            // Nessun bird ha passato la prima pipe, reinizializzo tutti i valori
            console.log("Recreate random population...")
            mutationRate = 1
        }
        for (let i = 0; i < this.diedBirds.length; i++) {
            let b = this.diedBirds[i]
            b.reset()
            if (i >= birdsCount * top && i < birdsCount * group1) {
                b.brain.mutate(this.diedBirds[0].brain, this.diedBirds[1].brain, mutationRate)
            } else if (i >= birdsCount * group1 && i < birdsCount * group2) {
                b.brain.mutate(this.diedBirds[Math.floor(random() * birdsCount * top)].brain, this.diedBirds[Math.floor(random() * birdsCount * top)].brain, mutationRate)
            } else if (i >= birdsCount * group2) {
                let randomIndex = Math.floor(random() * birdsCount * 0.1)
                b.brain.mutate(this.diedBirds[randomIndex].brain, this.diedBirds[randomIndex].brain, 0.1)
            }
        }

        // I primi 4 saranno i migliori
        this.activeBirds = this.diedBirds
        this.activeBirds[0].best = true
        this.diedBirds = []
    }
}