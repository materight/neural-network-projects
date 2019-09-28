
class Matrix extends Array {
    constructor(x, y, valfn = () => 0) {
        super(x)
        this.x = x
        this.y = y
        for (let i = 0; i < x; i++) {
            this[i] = []
            for (let j = 0; j < y; j++) {
                this[i][j] = valfn(i, j)
            }
        }
    }

    // Matrix from Matrix or Array
    static from(vals) {
        const isArray = !Array.isArray(vals[0])
        let x = isArray ? 1 : vals.length
        let y = isArray ? vals.length : vals[0].length
        return new Matrix(x, y, (i, j) => isArray ? vals[j] : vals[i][j])
    }

    // Matrix multiplication
    mul(M, initialValue = null) {
        if (M instanceof Matrix) {
            this.__assert(this.y == M.x, M, 'mul')
            return new Matrix(this.x, M.y, (i, j) => {
                let sum = initialValue ? initialValue[0][j] : 0
                for (let k = 0; k < this.y; k++) sum += this[i][k] * M[k][j]
                return sum
            })
        } else {
            return this.map(x => x * M)
        }
    }

    // Addition
    add(M) {
        if (M instanceof Matrix) {
            this.__assert(this.x == M.x && this.y == M.y, M, 'add')
            return this.map((x, i, j) => x + M[i][j])
        } else {
            return this.map(x => x + M)
        }
    }

    // Subtraction
    sub(M) {
        if (M instanceof Matrix) {
            this.__assert(this.x == M.x && this.y == M.y, M, 'sub')
            return this.map((x, i, j) => x - M[i][j])
        } else {
            return this.map(x => x - M)
        }
    }

    // Div
    div(M) {
        if (M instanceof Matrix) {
            this.__assert(this.x == M.x && this.y == M.y, M, 'div')
            return this.map((x, i, j) => x / M[i][j])
        } else {
            return this.map(x => x / M)
        }
    }

    // Transposition
    T() {
        return new Matrix(this.y, this.x, (i, j) => this[j][i])
    }

    // Converte la matrice in un array
    flatten() {
        let res = []
        for (let i = 0; i < this.x; i++) res = res.concat(this[i])
        return res
    }

    fill(val) {
        for (let i = 0; i < this.x; i++)
            for (let j = 0; j < this.y; j++)
                this[i][j] = val
    }

    // Calculate weighted sum and add biases
    feed(weights, biases) {
        return this.mul(weights, biases)
    }

    map(callbackfn) {
        return new Matrix(this.x, this.y, (i, j) => callbackfn(this[i][j], i, j))
    }

    reduce(callbackfn, initialValue = 0) {
        let previousValue = initialValue
        for (let row of this)
            for (let x of row)
                previousValue = callbackfn(previousValue, x)
        return previousValue
    }

    reduceRows(callbackfn, initialValue = 0) {
        return new Matrix(this.x, 1, (i, j) => this[i].reduce(callbackfn, initialValue))
    }

    reduceColumns(callbackfn, initialValue = 0) {
        return new Matrix(1, this.y, (i, j) => {
            let sum = initialValue
            for (k = 0; k < this.x; k++) sum += this[k][j]
            return sum
        })
    }

    __assert(condition, M, op) {
        if (!condition) throw 'MatrixError: cannot execute "' + op + '" between ' + this.x + 'x' + this.y + ' and ' + M.x + 'x' + M.y
    }
}

