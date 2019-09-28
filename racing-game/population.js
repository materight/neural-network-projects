const carsCount = manual ? 1 : 50

const inputNodesCount = 6
const hiddenNodesCount = 7
const outNodesCount = 3

class Population {
    constructor(x, y) {
        this.count = carsCount
        this.active = []
        this.crashed = []

        for (let i = 0; i < this.count; i++) {
            this.active[i] = new Car(x, y, new NeuralNetwork(inputNodesCount, hiddenNodesCount, outNodesCount))
        }
    }

    draw() {
        for (let c of this.active) c.draw()
        for (let c of this.crashed) c.draw()
    }

    update() {
        for (let c of this.active) c.update()
    }

    collide() {
        // Rimozione birds morti
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (this.active[i].collided(track) || millis() - this.active[i].inactiveTimer > 3000) {
                // Se la macchina si è scontrata contro le pareti o non ha passato checkpoint per 3 secondi, viene uccisa
                this.crashed.push(this.active[i])
                this.active.splice(i, 1)
            }
        }
    }

    allCrashed() {
        return this.active.length == 0
    }

    mutate() {
        this.crashed.sort((a, b) => a.fitness > b.fitness ? -1 : 1)
        console.log("Best fitness: ", this.crashed[0].fitness)
        let mutationRate = max(1 - Matrix.activation(this.crashed[0].fitness / 800), 0.01)
        console.log("Mutation rate: ", mutationRate)

        /*let mutationRate = 0.1
        if (this.crashed.every(c => c.laps == 0 && c.nextCheckpoint == 0)) {
            console.log("New random population")
            mutationRate = 1
        }*/

        const top = carsCount * 0.1
        const group1 = carsCount * 0.5
        const group2 = carsCount * 0.7
        for (let i = 0; i < carsCount; i++) {
            let b = this.crashed[i]
            b.reset()
            if (i >= top && i < group1) {
                b.brain.mutate(this.crashed[0].brain, this.crashed[0].brain, mutationRate)
                b.color = "#41b6e6"
            } else if (i >= group1 && i < group2) {
                b.brain.mutate(this.crashed[0].brain, this.crashed[1].brain, mutationRate)
                b.color = "#6abe83"
            } else if (i >= group2) {
                b.color = "#f700ad"
                b.brain.mutate(this.crashed[Math.floor(random(0, top))].brain, this.crashed[Math.floor(random(0, top))].brain, mutationRate)

            }
        }

        // I primi 4 saranno i migliori
        this.active = this.crashed
        this.active[0].color = "#F9CE00"
        this.active.reverse()
        this.crashed = []
    }
}