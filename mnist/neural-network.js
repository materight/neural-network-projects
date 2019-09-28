class Layer {
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

class NeuralNetwork {
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

    train(X, Y, options = {}) {
        options.batchSize = options.batch_size || 100
        options.epochs = options.epochs || 10
        options.eta = options.eta || 0.5 // Learning rate
        options.beta = options.beta || 0.9

        for (let e = 1; e <= options.epochs; e++) {
            shuffleData(X, Y)
            let loss = 0, accuracy = 0

            for (let i = 0; i < X.length; i++) {
                let out = this.feedforward(X[i])
                this.backprop(out, Y[i])

                loss += out.reduce((sum, x, j) => sum + this.loss(x, Y[i][j]), 0)
                accuracy += (Y[i].indexOf(1) == out.indexOf(Math.max(...out))) ? 1 : 0

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
        return ((baseURI, nnExportedData, fnName, ...args) => {
            importScripts(baseURI + 'neural-network.js', baseURI + 'matrix.js')
            let nn = new NeuralNetwork(nnExportedData.lossFn)
            nn.import(nnExportedData)
            let res = nn[fnName](...args)
            return { data: nn.export(), result: res }
        }).callAsync(null, baseURI, this.export(), fn.name, ...args).then(x => {
            this.import(x.data)
            return x.result
        })
    }
}

class LossFn {
    // Mean Squared Error
    static mse(yHat, y) {
        return (yHat - y) ** 2
    }
    static Dmse(yHat, y) {
        return 2 * (yHat - y)
    }

    // Cross-Entropy
    static crossEntropy(yHat, y) {
        if (yHat == y) yHat = Math.abs(y - Number.EPSILON)
        return -(y * Math.log(yHat) + (1 - y) * Math.log(1 - yHat))
    }
    static DcrossEntropy(yHat, y) {
        if (yHat == y) yHat = Math.abs(y - Number.EPSILON)
        return (yHat - y) / (yHat * (1 - yHat))
    }

    // Helpers
    static get(fnName) {
        switch (fnName) {
            case 'mse': return LossFn.mse
            case 'crossentropy': return LossFn.crossEntropy
            default: throw 'LossFnError: function ' + fnName + ' not recognized'
        }
    }
    static getD(fnName) {
        switch (fnName) {
            case 'mse': return LossFn.Dmse
            case 'crossentropy': return LossFn.DcrossEntropy
            default: throw 'LossDerivativeFnError: function ' + fnName + ' not recognized'
        }
    }
}

class ActivFn {
    // Sigmoid
    static sigmoid(M) {
        return M.map(x => 1 / (1 + Math.exp(-x)))
    }
    static Dsigmoid(M) {
        return M.map(x => (1 / (1 + Math.exp(-x))) * (1 - (1 / (1 + Math.exp(-x)))))
    }

    // Softmax
    static softmax(M) {
        let S = M.reduce((sum, x) => sum + Math.exp(x), 0)
        return M.map(x => Math.exp(x) / S)
    }
    static Dsoftmax(M) {
        let S = M.reduce((sum, x) => sum + Math.exp(x), 0)
        return M.map(x => (Math.exp(x) * (S - Math.exp(x))) / (S ** 2))
    }

    // ReLU
    static relu(M) {
        return M.map(x => Math.max(0, x))
    }
    static Drelu(M) {
        return M.map(x => (x > 0) ? 1 : 0)
    }


    // Helpers
    static get(fnName) {
        switch (fnName) {
            case 'sigmoid': return ActivFn.sigmoid
            case 'softmax': return ActivFn.softmax
            case 'relu': return ActivFn.relu
            default: throw 'ActivFnError: function ' + fnName + ' not recognized'
        }
    }

    static getD(fnName) {
        switch (fnName) {
            case 'sigmoid': return ActivFn.Dsigmoid
            case 'softmax': return ActivFn.Dsoftmax
            case 'relu': return ActivFn.Drelu
            default: throw 'ActivDerivativeFnError: function ' + fnName + ' not recognized'
        }
    }
}

function shuffleData(X, Y) {
    var j, x, y, i;
    for (i = X.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = X[i];
        y = Y[i];
        X[i] = X[j];
        Y[i] = Y[j];
        X[j] = x;
        Y[j] = y;
    }
}

// Funzione per eseguire funzioni come web workers. Ritorna una Promise 
Function.prototype.callAsync = function (thisArg, ...args) {
    return new Promise((resolve, reject) => {
        const code = 'self.onmessage = e => self.postMessage(( ' + this.toString() + ').call(...e.data));'
        const blob = new Blob([code], { type: "text/javascript" })
        const worker = new Worker(window.URL.createObjectURL(blob))
        worker.onmessage = e => (resolve(e.data), worker.terminate())
        worker.onerror = e => (reject(e.message), worker.terminate())
        worker.postMessage([thisArg, ...args]);
    });
}
