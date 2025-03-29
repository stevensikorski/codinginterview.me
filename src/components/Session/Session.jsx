

// Play video from camera 
const playVideoFromCamera = async (stream) => {
    try {
        const videoElement = document.querySelector('video#localVideo')
        videoElement.srcObject = stream 
    } catch (error) {
        console.log(error)
    }
}

// Enumerate user media devices
const openUserMedia = async () => {
    try {
        const constraints = {
            'video': true,
            'audio': true
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        playVideoFromCamera(stream)
    } catch (error) {
        console.log(error)
    }
}

// Placeholder 
const Session = () => {
    openUserMedia()
    return (
        <video id="localVideo" autoplay playsinline controls="false"/>
    );
}

export default Session