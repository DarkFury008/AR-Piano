const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

let hands;
let currentFinger = null;
let smoothX = 0;
let smoothY = 0;

async function startCamera() {

    try {

        // Prefer rear camera
        let stream;

        try {

            stream = await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    }

                },

                audio: false

            });

        } catch {

            stream = await navigator.mediaDevices.getUserMedia({

                video: true,
                audio: false

            });

        }

        video.srcObject = stream;

        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        startButton.style.display = "none";

        initializeHands();

        processFrame();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

function initializeHands() {

    hands = new Hands({

        locateFile: (file) => {

            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

        }

    });

    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 0,

        minDetectionConfidence: 0.75,

        minTrackingConfidence: 0.75

    });

    hands.onResults(onResults);

}

async function processFrame() {

    await hands.send({

        image: video

    });

    requestAnimationFrame(processFrame);

}

function onResults(results) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ---------- Draw Piano ----------

    const keyCount = 7;

    const keyboardWidth = canvas.width * 0.90;

    const keyboardHeight = 140;

    const startX = (canvas.width - keyboardWidth) / 2;

    const startY = canvas.height - keyboardHeight - 30;

    const keyWidth = keyboardWidth / keyCount;

    const notes = ["C","D","E","F","G","A","B"];

    let fingerX = -100;
    let fingerY = -100;

    if(results.multiHandLandmarks.length > 0){

        currentFinger = results.multiHandLandmarks[0][8];

        const targetX = currentFinger.x * canvas.width;
        const targetY = currentFinger.y * canvas.height;

        smoothX += (targetX - smoothX) * 0.70;
        smoothY += (targetY - smoothY) * 0.70;

        fingerX = smoothX;
        fingerY = smoothY;
    }

    for(let i=0;i<keyCount;i++){

        const x = startX + i * keyWidth;

        const hovering =
            fingerX > x &&
            fingerX < x + keyWidth &&
            fingerY > startY &&
            fingerY < startY + keyboardHeight;

        ctx.fillStyle = hovering ? "#4da6ff" : "rgba(255,255,255,0.75)";

        ctx.fillRect(
            x,
            startY,
            keyWidth,
            keyboardHeight
        );

        ctx.strokeStyle = "black";

        ctx.strokeRect(
            x,
            startY,
            keyWidth,
            keyboardHeight
        );

        ctx.fillStyle = "black";

        ctx.font = "26px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            notes[i],
            x + keyWidth/2,
            startY + keyboardHeight - 18
        );

    }

    // ---------- Finger ----------

    if(results.multiHandLandmarks.length > 0){

        ctx.beginPath();

        ctx.arc(
            fingerX,
            fingerY,
            14,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "red";

        ctx.fill();

    }

}

startButton.addEventListener("click",startCamera);