const URL = "https://teachablemachine.withgoogle.com/models/ZCr4WhZos/";

let model, webcam, labelContainer, maxPredictions, stream;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(224, 224, flip);
    await webcam.setup();
    stream = webcam.stream; // Store stream to stop later
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let maxIndex = 0;
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > prediction[maxIndex].probability) {
            maxIndex = i;
        }
    }
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(1)}%`;
        const labelDiv = labelContainer.childNodes[i];
        labelDiv.innerHTML = classPrediction;
        labelDiv.classList.toggle("highlight", i === maxIndex);
    }
}

// Optional: Stop camera stream
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}
