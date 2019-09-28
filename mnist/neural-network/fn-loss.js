export default class LossFn {
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
