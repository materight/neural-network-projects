const CANVAS_SIZE = 420

var userImg
var pMouseIsPressed, prediction
var mnist

function setup() {
    console.log("OK")
    createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent('#container')
    userImg = createGraphics(CANVAS_SIZE, CANVAS_SIZE)

    background('black')
    stroke('white')
    strokeWeight(16)

    pMouseIsPressed = false
    prediction = select('#prediction')

    select('#clear-btn').mousePressed(() => {
        prediction.hide()
        background('black')
    })

    select('#export-btn').mousePressed(() => {
        mnist.export()
    })


    // Init neural network
    mnist = new Mnist()
    let init = async () => {
        await mnist.load()
        await mnist.train()
        let accuracy = await mnist.test()
        console.log("--- TESTING RESULTS ---")
        console.log(`Total: ${(accuracy.reduce((sum, x) => sum + x.acc, 0) * 100 / accuracy.reduce((res, x) => res + x.total, 0)).toFixed(2)}%`)
        accuracy.forEach((x, i) => console.log(`${i}: ${((x.acc / x.total) * 100).toFixed(2)}%`))
    }
    init().then(() => {
        console.log("Done training and testing")
    }).catch(e => {
        console.error("Error: ", e)
    })
}

function draw() {
    if (mouseIsPressed) {
        line(pmouseX, pmouseY, mouseX, mouseY)
        pMouseIsPressed = true
    } else if (pMouseIsPressed) {
        pMouseIsPressed = false
        predict()
    }
}

function predict() {
    let input = getPixels()
    console.log("input: ", input)
    let result = mnistModel.predict(input)
    prediction.show()
    prediction.html(`${result.label} (${(result.prob * 100).toFixed(2)})`)
}

function getPixels() {
    let img = userImg.get()
    img.resize(28, 28)
    img.loadPixels()
    return pixels.reduce((res, x, i) => {
        if (i % 4 == 0) res.push(x / 255)
        return res
    }, [])
}