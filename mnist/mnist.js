import NeuralNetwork from './neural-network/neural-network.js'

export default class Mnist {
    constructor() {
        this.data = {}
        this.nn = new NeuralNetwork('crossentropy')
        this.nn.add(28 * 28, 32, 'relu') // Hidden + Input
        this.nn.add(32, 10, 'softmax') // Output
    }

    load() {
        let files = {
            train_images: 'train-images.idx3-ubyte',
            train_labels: 'train-labels.idx1-ubyte',
            test_images: 't10k-images.idx3-ubyte',
            test_labels: 't10k-labels.idx1-ubyte',
        };
        return Promise.all(Object.keys(files).map(async file => {
            this.data[file] = await loadFile('dataset/' + files[file])
            console.log(this.data)
        }))
    }

    train() {
        return this.nn.trainAsync(this.data.train_images, this.data.train_labels, {
            batchSize: 500,
            epochs: 10,
            eta: 0.5
        })
    }

    predict(input) {
        return this.nn.predict(input)
    }

    test() {
        return this.nn.testAsync(this.data.test_images, this.data.test_labels)
    }

    export() {
        downloadObjectJson(this.nn.export())
    }

    import(file) {
        this.nn.import(importObjectJson(file))
    }
}

async function loadFile(file) {
    let buffer = await fetch(file).then(r => r.arrayBuffer());
    let headerCount = 4;
    let headerView = new DataView(buffer, 0, 4 * headerCount);
    let headers = new Array(headerCount).fill().map((_, i) => headerView.getUint32(4 * i, false));

    // Get file type from the magic number
    let type, dataLength;
    if (headers[0] === 2049) {
        type = 'label';
        dataLength = 1;
        headerCount = 2;
    } else if (headers[0] === 2051) {
        type = 'image';
        dataLength = headers[2] * headers[3];
    } else {
        throw new Error("Unknown file type " + headers[0])
    }

    let data = new Uint8Array(buffer, headerCount * 4);
    let res = []
    if (type === 'label') {
        for (let i = 0; i < headers[1]; i++) {
            let a = Array(10).fill(0)
            a[data[i]] = 1
            res.push(a)
        }
    } else if (type === 'image') {
        for (let i = 0; i < headers[1]; i++) {
            res.push(data.subarray(dataLength * i, dataLength * (i + 1)));
        }
    }
    return res;
}

function downloadObjectJson(exportObj) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'neural-network.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importObjectJson(file) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'neural-network.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}