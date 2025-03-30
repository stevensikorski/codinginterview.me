// Integrate this to the IDE
var stream = null
var micState = false
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
    console.log("i am called")
    try {
        const constraints = {
            'video': true,
            'audio': true
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints)
        micState = true
        playVideoFromCamera(stream)
        const audioTracks = stream.getAudioTracks()
        console.log(audioTracks)
    } catch (error) {
        console.log(error)
    }
}

// Toggles audio output (on/off)
const toggleMic = () =>{
    if (stream){
        if (micState){
            stream.getAudioTracks().forEach(track => {
                track.enabled = false
            })
            micState = false
        }
        else {
            stream.getAudioTracks().forEach(track => {
                track.enabled = true
            })
            micState = true
        }
    }
}

// Starts a video in the current webpage, linking to the below <video> element
const Session = () => {
    console.log("loaded session")
    openUserMedia()
    return (
        <div id="video">
            <video id="localVideo" autoPlay playsInline></video>
            <button onClick={toggleMic}>Toggle Audio</button>
        </div>
    );
}

export default Session