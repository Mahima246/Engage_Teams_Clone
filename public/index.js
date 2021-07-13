import help from "./func.js";
const socket = io("/"); //visiting root route makes a socket connection

// Maintaing the DOM
const videoGrid = document.getElementById("video-grid");
const chatInputs = document.getElementById("msg");
const all_messages = document.getElementById("all_msgs");
const leaveMeet = document.getElementById("leave-meeting");
const chat_window = document.getElementById("msg_window");


//created a video element to append in doc 
var myVideo = document.createElement("video"); 
myVideo.muted = true;


// PEER CONNECTIONS
// setting up peer connections to connect to the server hosted on heroku
var peer = new Peer( {
    secure: true,
    host: 'peerheroku.herokuapp.com',
    port:  443,
    // path: '/peer-js',
})



// PEER CONNECTION TO PEER SERVER
peer.on('open', id => {
    console.log(id);
    currentuserId = id;
    socket.emit('join-room', room_id, id)
});

// INITIAL STATES
var my_name = "";
var myVideostream;
var currentuserId;
var peers = {};
 //peers is actually the array of calls for a particular peer to all other.
var record = '';
var mediaRecorder = '';
var currentPeer = [];
var names_ids = {};


// VIDEO AND AUDIO EXCHANGE
help.getUserFullMedia().then((stream) => {
    myVideostream = stream;
    addvideoStream(myVideo, stream, 'Me');
    console.log('got localmediastream');

    // PEER RECEIVING CALL
    peer.on('call', (call) => {
        console.log('call recievd');
        call.answer(stream)
        //Answer a coming call by giving our stream.
        console.log('call anserwred');
        console.log(call.peer);

        peers[call.peer] = call;
        currentPeer.push(call.peerConnection);
        const video = document.createElement('video');


        call.on('stream', (comingVideoStream) => { 
            //Adding the video streams of the people present in the incoming call to our video grid
            console.log('remotestream ');
            console.log(comingVideoStream);
            addvideoStream(video, comingVideoStream,call.peer); //pass name of the user 
        });
        
        call.on('close', () => {
            video.remove();
            help.adjustGrid();
        });
    });

    // NEW PEER CONNECTED
    socket.on('user-connected', (userid) => {
        console.log("New user connected...")
        setTimeout(connectNewUser, 1000, userid, stream);
    });


    // USER DISCONNECTED
    socket.on('user-disconnected', (userid) => {
        if (peers[userid]) {peers[userid].close();delete peers[userid];console.log(peers);}
        //Speak out the name of the user that left the meet.
        // help.speakText(`${names_ids[userid]} left`);
        if(names_ids[userid]) {delete names_ids[userid];}
    });

}).catch((e) => {
    console.error(`stream error: ${ e }`);
});


//Entering our name in the beginning of the stream.
document.getElementById('submitName').addEventListener('click',()=>{
    let value = help.checkInput();
    if(value){
     my_name = value;
     $('#myModal').modal('hide');
     names_ids[currentuserId] = value;
     socket.emit('name',{
         name: value,
         id: currentuserId,
     });
    }
    console.log(value);
});
//submitting the name
document.getElementById('submitName').addEventListener('keypress',(e)=>{
    let value = help.checkInput();
    if(e.key === 'Enter' && value){
     my_name = value;
     $('#myModal').modal('hide');
     names_ids[currentuserId] = value;
     socket.emit('name',{
         name: value,
         id: currentuserId,
     });
    }
    console.log(value);
});

socket.on('nameReceived',(names)=>{
    if(!(names.id in names_ids) ){
    names_ids[names.id] = names.name;}
    console.log(names_ids);
    socket.emit('nameSend',{
        name: my_name,
        id: currentuserId,
    });
})

socket.on('nameSended',(names)=>{
    if(!(names.id in names_ids) ){
        names_ids[names.id] = names.name;}
})




// CHAT
//sending and recieving messages using web sockets
socket.on('createMessage', (message) => {
    console.log(message);
    let msgli = document.createElement('li');
    if (message.user != currentuserId) {
        //to distinguish among the css of senders and receiver
        msgli.classList.add('otherUser');
        msgli.innerHTML = `<div><b>${names_ids[message.user]}:</b>${message.msg}</div>` + "\n";
    } else {
        //to distinguish among the css of senders and receiver
        msgli.classList.add('Me');
        msgli.innerHTML = `<div><b>${my_name}:</b>${message.msg}</div>` + "\n" ;
    }
    all_messages.append(msgli);
    chat_window.scrollTop = chat_window.scrollHeight;
    if (message.user != currentuserId) {
        pendingMsg++;
        help.playChatSound();
        help.has_new(true);
        document.getElementById('chat_btn').classList.add('has_new');
    }
});

//to send msgs vis enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});
// to send message via mouse click on button
document.getElementById('sendMsg').addEventListener('click', (e) => {
    if (chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});
//remove has new 
chatInputs.addEventListener('focus', () => {
    help.has_new(false);
    document.getElementById('chat_btn').classList.remove('has_new'); 
    pendingMsg = 0;
    document.getElementById('chat_btn').children[1].innerHTML = `Chat`;
});



//SAVE STREAM


//Saving My stream and adding stream to grid
const addvideoStream = (videoT1, stream, U_id = "") => {
    //adding video element and stream to the html and increasing total users.
    videoT1.srcObject = stream;
    videoT1.id = U_id;
    
    videoT1.class = "Video";
    videoT1.title = U_id;
    videoT1.addEventListener("loadedmetadata", () => {
        //stream has arrived we play the video, only when all the meta data is loaded. 
        videoT1.play();
    });
    videoGrid.append(videoT1);
    help.adjustGrid();
};

// Calling the new user connected and adding it to our grid and peers array.
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
    });
    peers[call.peer] = call;
    currentPeer.push(call.peerConnection);
    console.log(call.peer);
    console.log(peers);
};



// TOGGLE BUTTONS

// video
document.getElementById('playPauseVideo').addEventListener('click', (e) => {
    e.preventDefault();

    let enabled = myVideostream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideostream.getVideoTracks()[0].enabled = false;
        help.setPlayVideo();
    } else {
        help.setStopVideo();
        myVideostream.getVideoTracks()[0].enabled = true;
    }
});

// Audio mute unumute
document.getElementById('muteButton').addEventListener('click', (e) => {
    e.preventDefault();
    let enabled = myVideostream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideostream.getAudioTracks()[0].enabled = false;
        help.setUnmute();
    } else {
        myVideostream.getAudioTracks()[0].enabled = true;
        help.setMute();
    }
});

// chat
document.getElementById('chat_btn').addEventListener('click',(e) => {
    let el = document.getElementById('chat_btn');
    help.Showchat(el);
})



//PARTICIPANTS
document.getElementById('Participants').addEventListener('click',(e)=>{

    var keys = Object.keys(names_ids);
    var myList = '<tr>';
    
    keys.forEach((key, index) => {
        console.log(`${key}: ${names_ids[key]}`);
        // myList += '<th scope="col">'+names_ids.size+'</th>';
        myList += '<th scope="col">'+names_ids[key]+'</th>';
        myList += '</tr>';
    });
    
    document.getElementById('users_body').innerHTML = myList;
    help.toggleModal('participants_div',true);
    console.log(myList);
    });

//close participants
document.getElementById('close_participants').addEventListener('click',(e)=>{
    help.toggleModal('participants_div',false);
    });

//mouseover video title
document.getElementById('video-grid').addEventListener('mouseover',function(event){
    if(event.target.tagName == "VIDEO")
    {   
        let id = event.target.getAttribute('id');
        if(id === "Me") {
            event.target.setAttribute("title",my_name);
        }
        else{
            event.target.setAttribute("title",names_ids[id]);
        }
        
        console.log(event.target.id);
    }
    
    });


// Invite people
document.getElementById('show_invite').addEventListener('click',(e)=>{
    document.body.classList.add('showInvite');
    document.getElementById("roomLink").value = window.location.href;
    });

document.getElementById('hideInvitePopup').addEventListener('click',(e)=>{
    document.body.classList.remove('showInvite');
    });


//copy to clipboard
document.getElementById('copyToClipboard').addEventListener('click',(e)=>{
    var copytext = document.getElementById("roomLink");

    copytext.select();
    copytext.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.classList.remove('showInvite');
    
});


// Share Screen
document.getElementById('share-screen').addEventListener('click',(e)=>{
    e.preventDefault();
    help.shareScreen().then((stream)=>{
        help.toggleShareIcons( true );
        help.toggleScreenBtnDisabled(true);
        //save my screen stream
        screen = stream;
         //share the new stream with all partners
         let videoTrack = stream.getVideoTracks()[0];
        
        currentPeer.forEach((value)=>{
            let sender = value.getSenders().find(function(s){
                return s.track.kind == videoTrack.kind; 
            })
            sender.replaceTrack(videoTrack);
        })


        videoTrack.addEventListener( 'ended', () => {
            stopSharingScreen();
        } );

    });
    });


// Record
// Ask user what they want to record. and get the stream based on selection 
document.getElementById( 'record' ).addEventListener( 'click', ( e ) => {

    if ( !mediaRecorder || mediaRecorder.state == 'inactive' ) {
        help.toggleModal( 'recording-options-modal', true );
    }

    else if ( mediaRecorder.state == 'paused' ) {
        mediaRecorder.resume();
    }

    else if ( mediaRecorder.state == 'recording' ) {
        mediaRecorder.stop();
        
        let tracks = record.getTracks();

        tracks.forEach(track => track.stop());


    }
});
//When user choose to record screen
document.getElementById( 'record-screen' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

    if ( record && record.getVideoTracks().length ) {
        startRecording( record );
    }

    else {
        help.shareScreen().then( ( screenStream ) => {
            record = screenStream;
            startRecording( screenStream );
        } ).catch( () => { } );
    }
});
 //When user choose to record own video
document.getElementById( 'record-video' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

    if ( myVideostream && myVideostream.getTracks().length ) {
        startRecording( myVideostream );
    }
    else {
        help.getUserFullMedia().then( ( videoStream ) => {
            startRecording( videoStream );
        } ).catch( () => { } );
    }
});
//close recording 
document.getElementById( 'closeModal' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

});


