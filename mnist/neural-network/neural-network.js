import Layer from './layer.js'
import LossFn from './fn-loss.js'
import {shuffleData, callAsync} from './utils.js'

export default class NeuralNetwork {
    constructor(lossFn = 'crossentropy') {
        this.layers = []

        this.lossFn = lossFn
        this.loss = LossFn.get(lossFn)
        this.Dloss = LossFn.getD(lossFn)
    }

    // Add a layer with "size" neurons
    add(inputCount, neuronCount, activationFn = 'sigmoid') {
        this.layers.push(new Layer(inputCount, neuronCount, activationFn))
    }

    // Calculate output based on given input
    feedforward(X) {
        X = Matrix.from(X)
        for (let layer of this.layers)
            X = layer.feedforward(X)
        return X.flatten()
    }

    backprop(YHat, Y) {
        let dA = Matrix.from(YHat.map((yHat, i) => this.Dloss(yHat, Y[i])))
        for (let i = this.layers.length - 1; i >= 0; i--) {
            dA = this.layers[i].backprop(dA)
        }
    }

    train(input, labels, options = {}) {
        options.batchSize = options.batch_size || 100
        options.epochs = options.epochs || 10
        options.eta = options.eta || 0.5 // Learning rate
        options.beta = options.beta || 0.9

        for (let e = 1; e <= options.epochs; e++) {
            shuffleData(input, labels)
            let loss = 0, accuracy = 0

            for (let i = 0; i < input.length; i++) {
                let X = Array.from(input[i]).map(x => x / 255), Y = Array.from(labels[i])

                let out = this.feedforward(X)
                this.backprop(out, Y)


                loss += out.reduce((sum, x, j) => sum + this.loss(x, Y[j]), 0)
                accuracy += (Y.indexOf(1) == out.indexOf(Math.max(...out))) ? 1 : 0

                if ((i + 1) % options.batchSize == 0) {
                    // Applicazione gradient descent
                    for (let layer of this.layers) layer.update(options.batchSize, options.eta, options.beta)
                    console.log(`Epoch ${e}[${i + 1}]: loss=${(loss / options.batchSize).toFixed(3)}, accuracy=${((accuracy / options.batchSize) * 100).toFixed(2)}%`)
                    loss = accuracy = 0
                }
            }
        }
    }

    test(X, Y) {
        let accuracy = Array(10).fill({ acc: 0, total: 0 })
        for (let i = 0; i < X.length; i++) {
            let label = Y[i].indexOf(1)

            let out = this.feedforward(X[i])
            if (label == out.indexOf(Math.max(...out)))
                accuracy[label].acc++
            accuracy[label].total++
        }
        return accuracy
    }

    predict(X) {
        let out = this.feedforward(X)
        let prob = Math.max(...out)
        let label = out.indexOf(prob)
        return { label, prob }
    }

    import(data) {
        // Importazione dati rete neurale esistente
        this.layers = []
        for (let layer of data.layers) {
            let l = new Layer(layer.inputCount, layer.neuronCount, layer.activationFn, false)
            l.b = Matrix.from(layer.b)
            l.w = Matrix.from(layer.w)
            this.layers.push(l)
        }
    }

    export() {
        return { lossFn: this.lossFn, layers: this.layers.map(l => l.export()) }
    }

    trainAsync(X, Y, options = {}) {
        return this._executeAsync(this.train, X, Y, options)
    }

    testAsync(X, Y) {
        return this._executeAsync(this.test, X, Y)
    }

    _executeAsync(fn, ...args) {
        let baseURI = Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('neural-network.js')).baseURI
        return callAsync((baseURI, nnExportedData, fnName, ...args) => {
            importScripts(baseURI + 'neural-network.js', baseURI + 'matrix.js')
            let nn = new NeuralNetwork(nnExportedData.lossFn)
            nn.import(nnExportedData)
            let res = nn[fnName](...args)
            return { data: nn.export(), result: res }
        }, null, baseURI, this.export(), fn.name, ...args).then(x => {
            this.import(x.data)
            return x.result
        })
    }
}