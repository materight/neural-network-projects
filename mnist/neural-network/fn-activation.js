export default class ActivFn {
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