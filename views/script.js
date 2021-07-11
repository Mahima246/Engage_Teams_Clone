const socket = io("/"); //visiting root route makes a socket connection
const chatInputs = document.getElementById("msg");
const all_messages = document.getElementById("all_msgs");
const leaveMeet = document.getElementById("leave-meeting");
const chat_window = document.getElementById("msg_window");
const videoGrid = document.getElementById("video-grid");

// PEER CONNECTIONS
const peer = new Peer(undefined, {
    host: 'localhost',
    port: '3001',
    path: '/',
  })

let myVideostream;
let currentuserId;
let pendingMsg = 0;
let peers = {};


//For me and for each user
const myVideo = document.createElement("video"); //made a video element to append in doc 
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({ //gives current user stream both audio and video.
    audio: {
        echoCancellation: true,
        noiseSuppression: true
    },
   
    video: true
}).then((stream) => {
    myVideostream = stream;
    addvideoStream(myVideo, stream, 'me');
    console.log('got localmediastream');
    peer.on('call', (call) => { //handling coming calls.
        console.log('call recievd');
        call.answer(stream) //we will answer a coming call by giving our stream.//yahna we can ring popup to answer or not using socket.io
        console.log('call anserwred');
        const video = document.createElement('video');


        call.on('stream', (comingVideoStream) => { //jisne call kia tha uski stream add krdi in video grid
            console.log('got remotestream too! yay');
            console.log(comingVideoStream);
            addvideoStream(video, comingVideoStream); //pass name of the user too if want
        });
    });


//Above takes care ki jitne bhi logoki call hmare pass aayengi sbki video hmare lia hmare grid me hongi.

    socket.on('user-connected', (userid) => {
        console.log("New user connected...")
        setTimeout(connectNewUser,500,userid,stream);
        
    });
    socket.on('user-disconnected', (userid) => {
        if (peers[userid]) peers[userid].close();
    });


    document.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter' && chatInputs.value != '') {
            socket.emit('message', {
                msg: chatInputs.value,
                user: currentuserId,
            });
            chatInputs.value = '';
        }
    });

    document.getElementById('sendMsg').addEventListener('click', (e) => { // via mouse click on button
        if (chatInputs.value != '') {
            socket.emit('message', {
                msg: chatInputs.value,
                user: currentuserId,
            });
            chatInputs.value = '';
        }
    });

    chatInputs.addEventListener('focus', () => {
        document.getElementById('chat_btn').classList.remove('has_new');        //isse chat pe jo dot aata, it is removed but only when the box jisme msg type krte h get focus.
        pendingMsg = 0;
        document.getElementById('chat_btn').children[1].innerHTML = `Chat`;
    });

    socket.on('createMessage', (message) => {
        console.log(message);
        let li = document.createElement('li');      //li document to add in all_msgs ul
        if (message.user != currentuserId) {
            li.classList.add('otherUser');         //this is for keeping the css different.
            li.innerHTML = `<div><b>User(<small>${message.user}</small>):</b>${message.msg}</div>`
        } else {
            li.innerHTML = `<div><b>Me : </b>${message.msg}</div>`;
        }
        all_messages.append(li);
        chat_window.scrollTop = chat_window.scrollHeight;
        if (message.user != currentuserId) {
            pendingMsg++;
            playChatSound();
            document.getElementById('chat_btn').classList.add('has_new');
            document.getElementById(
                'chat_btn'
            ).children[1].innerHTML = `Chat (${pendingMsg})`;
        }
    });
});


// peer.on('call', function (call) {
//     getUserMedia({
//             video: true,
//             audio: true
//         },
//         function (stream) {
//             call.answer(stream);
//             const video = document.createElement('video');
//             call.on('stress', function (remoteStream) {
//                 addvideoStream(video, remoteStream);
//             });
//         },
//         function (err) {
//             console.log("Didn't get local stream", err)
//         }
//     );

// });  //uppar same cheez likhi h

peer.on('open', id => {
    console.log('hey');
    console.log(id);
    currentuserId = id;
    socket.emit('join-room', room_id, id)
});   //this for us first joining the meet , this is our id

socket.on('disconnect', function () {
    socket.emit('leave-room', room_id, currentuserId);
});   ///check once ispe kya hoga , nothing to handle.

//chat

const connectNewUser = (userid, streams) => {
    var call = peer.call(userid, streams);
    console.log('made call');
    var video = document.createElement("video");


        call.on("stream", (comingVideoStream) => {
            // console.log(comingVideoStream);
            console.log('call answered! by ');
            console.log(userid);
            addvideoStream(video, comingVideoStream, userid);
            console.log('got remotestream too! yay');
        });
        call.on('close', () => {
            video.remove();
            //window.refresh
        });
        peers[userid] = call;
       
    //peers is actually the array of calls for a particular peer to all other.
};

const playStop = () => {
    let enabled = myVideostream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideostream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideostream.getVideoTracks()[0].enabled = true;
    }
};


const muteUnmute = () => {
    let enabled = myVideostream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideostream.getAudioTracks()[0].enabled = false;
        setUnmute();
    } else {
        myVideostream.getAudioTracks()[0].enabled = true;
        setMute();
    }
};



//Every video elemnt in html has a id related to ki kis user ki video h and jaise hi stream mil jati h , camera on ho jata h .
const addvideoStream = (videoT1, stream, U_id = "") => { //adding video elemnt and stream to the html and increasing total users.
    videoT1.srcObject = stream;
    videoT1.id = U_id;
    videoT1.addEventListener("loadedmetadata", () => { //only when all the meta data is loaded , stream has arrived we play the video.
        videoT1.play(); //playing by default.
    });
    videoGrid.append(videoT1);
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let i = 0; i < totalUsers; i++) {
            document.getElementsByTagName("video")[i].style.width = 100 / totalUsers + "%"; //adjusting width of videos acc to no of users
            //this fits all video in one line evenly dividing their widths.
        }
    }

};



const setMute = () => {
    const text = `<i class = "fa fa-microphone"></i><span>Mute</span>`
    document.getElementById('muteButton').innerHTML = text;
};

const setUnmute = () => {
    const text = `<i class = "fas fa-microphone-slash"></i><span class="unmute">Unmute</span>`
    document.getElementById('muteButton').innerHTML = text;
};


const setStopVideo = () => {
    const text = `<i class = "fa fa-video"></i><span class="">Pause Video</span>`
    document.getElementById('playPauseVideo').innerHTML = text;
};

const setPlayVideo = () => {
    const text = `<i class = "fas fa-video-slash"></i><span class="">Play Video</span>`
    document.getElementById('playPauseVideo').innerHTML = text;
}



// 
const Showchat = (e) => {
    e.classList.toggle('active')
    document.body.classList.toggle('showchat')
}

const playChatSound = () => {
    const chatSound = document.getElementById('chatAudio');
    chatSound.play();
}

const speakText = (msg) => {
    const Msg = new SpeechSynthesisUtterance();
    Msg.text = msg;
    window.speechSynthesis.speak(Msg);
}

// Needx to fix chat css

const showinvite = () => {
    document.body.classList.add('showInvite');
    document.getElementById("roomLink").value = window.location.href;
}

const hideInvitePopup = () => {
    document.body.classList.remove('showInvite');
}

const copyToClipboard = () => {
    var copytext = document.getElementById("roomLink");

    copytext.select();
    copytext.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Copied: " + copytext.value);
    hideInvitePopup();
}

//jisne join ki h i.e. call accept ki h usko userids ni dikhre!


//record

var recordedStream = [];
var mediaRecorder = '';
var myStream = '';
var screen = '';

document.getElementById( 'record' ).addEventListener( 'click', ( e ) => {
    /**
     * Ask user what they want to record.
     * Get the stream based on selection and start recording
     */
    if ( !mediaRecorder || mediaRecorder.state == 'inactive' ) {
        toggleModal( 'recording-options-modal', true );
    }

    else if ( mediaRecorder.state == 'paused' ) {
        mediaRecorder.resume();
    }

    else if ( mediaRecorder.state == 'recording' ) {
        mediaRecorder.stop();
    }
} );


//When user choose to record screen
// document.getElementById( 'record-screen' ).addEventListener( 'click', () => {
//     toggleModal( 'recording-options-modal', false );

//     if ( screen && screen.getVideoTracks().length ) {
//         startRecording( screen );
//     }

//     else {
//         shareScreen().then( ( screenStream ) => {
//             startRecording( screenStream );
//         } ).catch( () => { } );
//     }
// } );


//When user choose to record own video
document.getElementById( 'record-video' ).addEventListener( 'click', () => {
    toggleModal( 'recording-options-modal', false );

    if ( myVideostream && myVideostream.getTracks().length ) {
        startRecording( myVideostream);
    }

    else {
        getUserFullMedia().then( ( videoStream ) => {
            startRecording( videoStream );
        } ).catch( () => { } );
    }
} );




function toggleRecordingIcons( isRecording ) {
    let e = document.getElementById( 'record' );

    if ( isRecording ) {
        e.setAttribute( 'title', 'Stop recording' );
        e.children[0].classList.add( 'text-danger' );
        e.children[0].classList.remove( 'text-white' );
    }

    else {
        e.setAttribute( 'title', 'Record' );
        e.children[0].classList.add( 'text-white' );
        e.children[0].classList.remove( 'text-danger' );
    }
}


function startRecording( stream ) {
    mediaRecorder = new MediaRecorder( stream, {
        mimeType: 'video/webm;codecs=vp9'
    } );

    mediaRecorder.start( 1000 );
    toggleRecordingIcons( true );

    mediaRecorder.ondataavailable = function ( e ) {
        recordedStream.push( e.data );
    };

    mediaRecorder.onstop = function () {
        toggleRecordingIcons( false );

        saveRecordedStream( recordedStream, currentuserId );

        setTimeout( () => {
            recordedStream = [];
        }, 3000 );
    };

    mediaRecorder.onerror = function ( e ) {
        console.error( e );
    };
}







// helper function , can make a separate file for them too:

userMediaAvailable = () => {
    return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
},


getUserFullMedia=()=> {
    if ( userMediaAvailable() ) {
        return navigator.mediaDevices.getUserMedia( {
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        } );
    }

    else {
        throw new Error( 'User media not available' );
    }
}


const toggleModal=( id, show )=> {
    let el = document.getElementById( id );

    if ( show ) {
        el.style.display = 'block';
        el.removeAttribute( 'aria-hidden' );
    }

    else {
        el.style.display = 'none';
        el.setAttribute( 'aria-hidden', true );
    }
}


const saveRecordedStream = ( stream, user ) => {
    let blob = new Blob( stream, { type: 'video/webm' } );

    let file = new File( [blob], `${ user }-record.webm` );

    saveAs( file );
};



// 
document.getElementById( 'closeModal' ).addEventListener( 'click', () => {
    helpers.toggleModal( 'recording-options-modal', false );
} );



// saveRecordedStream( stream, user ) {
//     let blob = new Blob( stream, { type: 'video/webm' } );

//     let file = new File( [blob], `${ user }-${ moment().unix() }-record.webm` );

//     saveAs( file );
// };

// toggleModal( id, show ) {
//     let el = document.getElementById( id );

//     if ( show ) {
//         el.style.display = 'block';
//         el.removeAttribute( 'aria-hidden' );
//     }

//     else {
//         el.style.display = 'none';
//         el.setAttribute( 'aria-hidden', true );
//     }
// }

