
class Matrix extends Array {
    constructor(x, y, val) {
        super(x)
        this.x = x
        this.y = y
        for (let i = 0; i < x; i++) {
            this[i] = []
            for (let j = 0; j < y; j++) {
                this[i][j] = val(i, j)
            }
        }
    }

    static zeros(x, y) {
        return new Matrix(x, y, () => 0)
    }

    static from(vals) {
        let x = vals.length
        let y = Array.isArray(vals[0]) ? vals[0].length : 1
        return new Matrix(x, y, (i, j) => Array.isArray(vals[i]) ? vals[i][j] : vals[i])
    }

    static activation(x) {
        return (2 / (1 + Math.exp(-2 * x))) - 1

    }

    feed(weight, bias) {
        if (this.y != weight.x) {
            throw 'Cannot multiply ' + this.x + 'x' + this.y + ' matrix with ' + M.x + 'x' + M.y
        } else if (this.x != bias.x || weight.y != bias.y) {
            throw 'Cannot add ' + this.x + 'x' + weight.y + ' matrix with ' + bias.x + 'x' + bias.y
        } else {
            return new Matrix(this.x, weight.y, (i, j) => {
                let sum = bias[i][j]
                for (let k = 0; k < this.y; k++) {
                    sum += this[i][k] * weight[k][j]
                }
                return Matrix.activation(sum)
            })
        }
    }

    T() {
        return new Matrix(this.y, this.x, (i, j) => this[j][i])
    }

    toString() {
        let res = ''
        for (let i = 0; i < this.x; i++) {
            res += '[ '
            for (let j = 0; j < this.y; j++) {
                res += this[i][j] + ', '
            }
            res += ']\n'
        }
        return res
    }
}
