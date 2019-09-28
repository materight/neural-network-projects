export function shuffleData(X, Y) {
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

export function callAsync(fn, thisArg, ...args) {
    return new Promise((resolve, reject) => {
        const code = 'self.onmessage = e => self.postMessage(( ' + fn.toString() + ').call(...e.data));'
        const blob = new Blob([code], { type: "text/javascript" })
        const worker = new Worker(window.URL.createObjectURL(blob))
        worker.onmessage = e => (resolve(e.data), worker.terminate())
        worker.onerror = e => (reject(e), worker.terminate())
        worker.postMessage([thisArg, ...args]);
    });
}
