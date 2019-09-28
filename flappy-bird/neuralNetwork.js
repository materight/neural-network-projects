class NeuralNetwork {
    constructor(inCount, hiddenCount, outCount) {
        this.inCount = inCount
        this.hiddenCount = hiddenCount
        this.outCount = outCount

        this.wH = new Matrix(inCount, hiddenCount, () => random() * sqrt(1 / inCount))
        this.wO = new Matrix(hiddenCount, outCount, () => random() * sqrt(1 / hiddenCount))

        this.biasH = new Matrix(1, hiddenCount, () => random() / 10)
        this.biasO = new Matrix(1, outCount, () => random() / 10)
    }

    feedForward(input) {
        // input sarà una matrice 1xinputLayerCount, ossia un vettore con l'input
        let outH = input.feed(this.wH, this.biasH)
        let outO = outH.feed(this.wO, this.biasO)
        return outO
    }
}