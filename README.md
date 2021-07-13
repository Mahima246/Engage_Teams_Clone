# Engage_Teams_Clone
# Video Meeting

## Live Demo

[Video Chat](http://my-teamsclone.herokuapp.com/)

![Website](https://imgur.com/WswhpxB.jpg)

### Features
- No account needed
- Unlimited users
- Messaging chat and video streaming in real-time
- Screen sharing to present documents, slides, and more
- Record Screen or your own video and save it to local storage
- Save your chat conversation
- Everyting is peer-to-peer thanks to webrtc

## Built With

-   [Node Js](https://nodejs.org/en/) - The Backend
-   [Peer JS](https://peerjs.com/) - PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls.
-   [SocketIo](https://socket.io/) - For realtime communication
-   [NPM](https://www.npmjs.com/) - Dependency Management
-   [GIT](https://git-scm.com/) - Used for version control
-   [Heroku](https://heroku.com) - Used to Deploy Node.js applications



### Local setup

Since the webapp is hosted on heroku currently so for local setup, first uncomment the localhost 
connection setup in index.js and comment out heroku connection setup in Index.js file .


![Website](https://imgur.com/TeAXEwU.jpg)

```
npm install
```

[Nodemon](https://www.npmjs.com/package/nodemon) For automatically restart the server as a dev dependency (optional)

```
npm i --sav-dev nodemon
```

If you have installed nodemon then you can use. (devStart script is already added to the package.json)

```
nodemon
```

or

```
node server.js
```

