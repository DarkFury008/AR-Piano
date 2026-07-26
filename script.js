const video = document.getElementById("camera");
const startButton = document.getElementById("startButton");

async function startCamera() {
    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        startButton.style.display = "none";

    } catch (err) {

        console.error("Camera Error:", err);

        alert(
            "Camera Error:\n\n" +
            err.name +
            "\n\n" +
            err.message
        );
    }
}

startButton.addEventListener("click", startCamera);