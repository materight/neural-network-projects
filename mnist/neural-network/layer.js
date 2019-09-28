import Matrix from './matrix.js'
import ActivFn from './fn-activation.js'

export default class Layer {
    constructor(inputCount, neuronCount, activationFn, initWeights = true) {
        this.inputCount = inputCount
        this.neuronCount = neuronCount
        this.activationFn = activationFn

        this.activ = ActivFn.get(activationFn)
        this.Dactiv = ActivFn.getD(activationFn)

        if (initWeights) {
            this.w = new Matrix(inputCount, neuronCount, () => randomGaussian(0, 1 / Math.sqrt(inputCount)))
            this.b = new Matrix(1, neuronCount, () => randomGaussian(0, 1 / Math.sqrt(inputCount)))
        }

        // Somma di tutti i gradient descent di un mini batch
        this.dw = new Matrix(inputCount, neuronCount, () => 0)
        this.db = new Matrix(1, neuronCount, () => 0)

        // Ultimi gradienti applicati, necessari per implementare il momentum
        this.lastdw = new Matrix(inputCount, neuronCount, () => 0)
        this.lastdb = new Matrix(1, neuronCount, () => 0)
    }

    feedforward(X) {
        this.X = X
        this.Z = X.feed(this.w, this.b)
        this.Y = this.activ(this.Z)
        return this.Y
    }

    backprop(gradient) {
        // Calcolo derivate parziali
        let dActivation = this.Dactiv(this.Z)
        let dLoss = gradient

        let db = this.Y.map((b, i, j) => dActivation[i][j] * dLoss[i][j])
        let dw = this.X.T().mul(db)
        let dA = db.mul(this.w.T())

        // Calcolo somma totale con i nuovi valori del gradient
        this.dw = this.dw.add(dw)
        this.db = this.db.add(db)

        return dA
    }

    update(batchSize, eta, beta) {
        this.lastdw = this.dw.map((x, i, j) => beta * this.lastdw[i][j] + (1 - beta) * (x / batchSize) * eta)
        this.lastdb = this.db.map((x, i, j) => beta * this.lastdb[i][j] + (1 - beta) * (x / batchSize) * eta)
        this.w = this.w.sub(this.lastdw)
        this.b = this.b.sub(this.lastdb)
        this.dw.fill(0)
        this.db.fill(0)
    }

    export() {
        return {
            inputCount: this.inputCount,
            neuronCount: this.neuronCount,
            activationFn: this.activationFn,
            w: this.w,
            b: this.b
        }
    }
}