# Engage_Teams_Clone

## Live Demo

[Video Chat](https://my-teamsclone.herokuapp.com/)

### Features
- No account is required.
- Mutiple rooms
- Audio and Video streaming in real time
- Chat feature along with option to save your chats so that you can continue the conversation after meeting ends.
- Screen Sharing
- Record option (Record your own video or your screen) and save it your system storage.
- Shows names of all the participants present.
- Add participant button to share link.

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

