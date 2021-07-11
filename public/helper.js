export default{

    // Check for availability of user media
    userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },
 
    // Returns user media if available
    getUserFullMedia() {
        if ( this.userMediaAvailable() ) {
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
    },

    setStopVideo() {
        const text = `<i class = "fa fa-video"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
    },
    
    setPlayVideo(){
        const text = `<i class = "fas fa-video-slash"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
    },

    setMute() {
        const text = `<i class = "fa fa-microphone"></i>`
        document.getElementById('muteButton').innerHTML = text;
    },
    
    setUnmute(){
        const text = `<i class = "fas fa-microphone-slash"></i>`
        document.getElementById('muteButton').innerHTML = text;
    },
    
    Showchat(e) {
        e.classList.toggle('active')
        document.body.classList.toggle('showchat')
    },
    
    playChatSound(){
        const chatSound = document.getElementById('chatAudio');
        chatSound.play();
    },
    
    saveDynamicDataToFile() {

        var userInput = document.getElementById("all_msgs").value;
        
        var blob = new Blob([userInput], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "chat.txt");
    },

    speakText(msg) {
        const Msg = new SpeechSynthesisUtterance();
        Msg.text = msg;
        window.speechSynthesis.speak(Msg);
    },

    shareScreen() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getDisplayMedia( {
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },

    toggleShareIcons( share ) {
        let shareIconElem = document.querySelector( '#share-screen' );

        if ( share ) {
            shareIconElem.setAttribute( 'title', 'Stop sharing screen' );
            shareIconElem.children[0].classList.add( 'text-primary' );
            shareIconElem.children[0].classList.remove( 'text-white' );
        }

        else {
            shareIconElem.setAttribute( 'title', 'Share screen' );
            shareIconElem.children[0].classList.add( 'text-white' );
            shareIconElem.children[0].classList.remove( 'text-primary' );
        }
    },
     
    toggleScreenBtnDisabled( x ) {
        // console.log('hey');
        if ( x === true ) {
            document.getElementById('share-screen').style.pointerEvents = 'none';
            // document.getElementById('share-screen').setAttribute('disabled', 'disabled');
            console.log('bndnow');
         } else {
            document.getElementById('share-screen').style.pointerEvents = 'auto';
            console.log('open');
         }
        // document.getElementById( 'share-screen' ).disabled = x;
    },

    
    toggleModal( id, show ) {
        let el = document.getElementById( id );

        if ( show ) {
            el.style.display = 'block';
            el.removeAttribute( 'aria-hidden' );
        }

        else {
            el.style.display = 'none';
            el.setAttribute( 'aria-hidden', true );
        }
    },

    toggleRecordingIcons( isRecording ) {
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
    },

    saveRecordedStream( stream, user ) {
        let blob = new Blob( stream, { type: 'video/webm' } );

        let file = new File( [blob], `${ user }-${ moment().unix() }-record.webm` );

        saveAs( file );
    },
}