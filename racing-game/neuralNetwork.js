class NeuralNetwork {
    constructor(inCount, hiddenCount, outCount) {
        this.inCount = inCount
        this.hiddenCount = hiddenCount
        this.outCount = outCount

        this.wH = new Matrix(inCount, hiddenCount, () => (2 * random() - 1) * sqrt(1 / (2 * inCount)))
        this.wO = new Matrix(hiddenCount, outCount, () => (2 * random() - 1) * sqrt(1 / (2 * hiddenCount)))

        this.biasH = new Matrix(1, hiddenCount, () => 0)
        this.biasO = new Matrix(1, outCount, () => 0)
    }

    feedForward(input) {
        // input sarà una matrice 1xinputLayerCount, ossia un vettore con l'input
        let outH = input.feed(this.wH, this.biasH)
        let outO = outH.feed(this.wO, this.biasO)
        return outO
    }

    mutateMatrix(M, A, B, mutationRate) {
        let shouldMutate = () => Math.random() < mutationRate
        let crossoverPoint = min(max(randomGaussian(0.5, 0.4), 0), 1) * (M.x * M.y)
        for (let i = 0; i < M.x; i++) {
            for (let j = 0; j < M.y; j++) {
                M[i][j] = (i * j < crossoverPoint) ? A[i][j] : B[i][j]
                if (shouldMutate()) M[i][j] = randomGaussian(M[i][j], 0.05)
            }
        }
    }

    mutate(parent1, parent2, mutationRate) {
        this.mutateMatrix(this.wH, parent1.wH, parent2.wH, mutationRate)
        this.mutateMatrix(this.wO, parent1.wO, parent2.wO, mutationRate)
        // this.mutateMatrix(this.biasH, parent1.biasH, parent2.biasH, mutationRate)
        //this.mutateMatrix(this.biasO, parent1.biasO, parent2.biasO, mutationRate)
    }
}