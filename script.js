const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
    facingMode: {
        exact: "environment"
    }
    },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    startButton.style.display = "none";

    const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks.length > 0) {
        const finger = results.multiHandLandmarks[0][8];

        ctx.beginPath();
        ctx.arc(
          finger.x * canvas.width,
          finger.y * canvas.height,
          12,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720
    });

    camera.start();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

startButton.addEventListener("click", startCamera);