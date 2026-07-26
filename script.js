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

    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(results.multiHandLandmarks.length>0){

        currentFinger = results.multiHandLandmarks[0][8];

        const targetX = currentFinger.x * canvas.width;

        const targetY = currentFinger.y * canvas.height;
        // Simple smoothing
        smoothX += (targetX - smoothX) * 0.70;
        smoothY += (targetY - smoothY) * 0.70;


        ctx.beginPath();

        ctx.arc(
            smoothX,
            smoothY,
            14,
            0,
            Math.PI * 2
        );

        ctx.fillStyle="red";

        ctx.fill();

    }

}

startButton.addEventListener("click",startCamera);