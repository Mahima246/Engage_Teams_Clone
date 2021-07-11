require('dotenv').config()
const express = require('express');
const app = express();
const {
    v4: uuidv4
} = require('uuid');
const server = require('http').Server(app) 
const io = require('socket.io')(server);

// const {ExpressPeerServer} = require('peer');          //doubt
// const peerServer = ExpressPeerServer(server,{
//     debug:true,
// })
const { PeerServer } = require('peer');
const peerServer = PeerServer({ secure:true, host:'https://my-teamsclone.herokuapp.com', port: 443, path: '/' });


app.set('view engine', 'ejs')
app.use(express.static('public'));
// app.use('/peerjs',peerServer);                        //doubt


app.get('/', function (req, res) {
    res.redirect(`/${uuidv4()}`);
});

app.get('/close',function(req,res){
    res.render('close');
})

app.get('/:room', function (req, res) {
    res.render('room', {
        roomId: req.params.room
    })
})

io.on("connection", (socket) => { //triggers if any new connection occurs.
    // console.log('nc');
    socket.on('join-room', function (roomid, userid) {
        socket.join(roomid);
        socket.broadcast.to(roomid).emit('user-connected', userid);
        socket.on('message', (message) => {
            io.to(roomid).emit('createMessage', message);
        });
        socket.on('name',(names)=>{
            socket.broadcast.to(roomid).emit('nameReceived', names);
        });
        socket.on('nameSend',(names)=>{
            socket.broadcast.to(roomid).emit('nameSended', names);
        });
        socket.on('disconnect', function (){
            socket.broadcast.to(roomid).emit("user-disconnected", userid);
        });
    });
});


server.listen(process.env.PORT || 3000, function (req, res) {
    console.log('Server started ...')
});
