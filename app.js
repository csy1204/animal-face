// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/o9D1N5TN/";

let model, webcam, labelContainer, maxPredictions;
let picked, opacity;
const images = ['dog', 'cat', 'bear', 'dinosaur', 'rabbit']

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels

        let cls = document.createElement('div')
        let span = document.createElement('span')
        let prog = document.createElement('progress')

        cls.setAttribute('class', 'cls')
        prog.setAttribute('value','0')
        prog.setAttribute('max', '100')

        cls.appendChild(span)
        cls.appendChild(prog)
        labelContainer.appendChild(cls)
    }
    // <div class="cls"><span>123</span><progress value="0" max="100"></progress></div>

    picked = null
    opacity = 0
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

const setBackground = (index, prob) => {
    if (prob < 70 || picked !== index) {
        opacity = Math.max(opacity - 0.01, 0)
    } else if (picked === index) {
        opacity = Math.min(opacity + 0.01, 1)
    }
    document.body.style.backgroundColor = `rgba(255,255,255,${1 - opacity})`;
    
    if (opacity < 0.02) {
        picked = index
        document.body.style.backgroundImage = `url('./img/${images[picked]}.jpg')`;
    }

}

// run the webcam image through the image model
async function predict() {
    let index = -1
    let maxProb = -1
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        let prob = prediction[i].probability*100
        labelContainer.children[i].firstElementChild.innerHTML = prediction[i].className
        labelContainer.children[i].lastElementChild.value = (prob)

        if (prob > maxProb) {
            index = i
            maxProb = prob
        }
    }

    setBackground(index, maxProb)
}

