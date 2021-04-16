const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer();
let mypeerid;

// const myVideo = document.createElement('video');
// myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    // addVideoStream(myVideo, stream);

    let call = myPeer.call('23', stream);
    const video = document.createElement('video');
    call.on('stream', (remoteStream) => {
        video.src = URL.createObjectURL(remoteStream);
        video.addEventListener('loadedmetadata', () => {
            video.play();
        })
        videoGrid.append(video);
    }, (err) => console.log('error' + err));

    // connectToNewUser(1, stream);
}).catch((e) => {
    alert('getUserMedia() error: ' + e.name);
});

myPeer.on('open', id => {
    console.log(id);
    mypeerid = id;

    let conn = myPeer.connect(this.mypeerid);
    conn.on('open', function () {
        conn.send('Message from that id');
    });
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}