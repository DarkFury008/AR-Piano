const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

let hands;
let currentFinger = null;

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
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
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

        modelComplexity: 1,

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

        const x=currentFinger.x*canvas.width;

        const y=currentFinger.y*canvas.height;

        ctx.beginPath();

        ctx.arc(x,y,14,0,Math.PI*2);

        ctx.fillStyle="red";

        ctx.fill();

    }

}

startButton.addEventListener("click",startCamera);