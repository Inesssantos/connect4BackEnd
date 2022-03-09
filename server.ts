/* ------------------------------------------------------------------------------------
*  To install the required modules:
*  $ npm install
*
*  To compile:
*  $ npm run compile
*
*  To setup:
*  1) Create a file ".env" to store the JWT secret:
*     JWT_SECRET=<secret>
*
*    $ echo "JWT_SECRET=secret" > ".env"
*
*  2) Generate HTTPS self-signed certificates
*    $ cd keys
*    $ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 36
*    $ openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
*
*
*  To run:
*  $ npm start
*
*
*/

import { variables } from './_helpers/read_env';

if(variables.PORT === ""){
  console.log("Unable to load \".env\" file. Please provide one to store the PORT of server");
 process.exit(-1);
}

require('rootpath')();
import path from 'path';
import colors = require('colors');
colors.enabled = true;

import express from 'express';
const app = express();
const http = require("http").Server(app)
const io = require("socket.io")(http,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});


import socket_rooms from './_helpers/socket_rooms';

import cookieParser = require ('cookie-parser');
import cors from 'cors';
import errorHandler from './_middleware/error-handler';

// create test user in db on startup if required
import createTestUser from './_helpers/create-test-user';
createTestUser();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join('uploads')));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("------------------------------------------------".inverse);
    console.log("New request for: " + req.url);
    console.log("Method: " + req.method);
    next();
  });

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/users', require('./routes/users/users.controller'));
app.use('/friends', require('./routes/friends/friends.controller'));
app.use('/moderator', require('./routes/moderator/moderator.controller'));
app.use('/messenger', require('./routes/chat/messenger.controller'));
app.use('/game', require('./routes/game/game.controller'));

// global error handler
app.use(errorHandler);

import gameService from './routes/game/game.service';

import { clearInterval } from 'timers';

io.on("connection", (socket: any) => {
  socket.on('joinToRoom', (value: any) => {
    
    if(value.room){
      console.log("[SOCKET - CHAT] -> user connect to Chat Room".yellow)

      const existUser = socket_rooms.getUserByUserIdAndRoom(value.userId, value.room)
      if(existUser){
        console.log("[SOCKET - CHAT] -> renovation users info in the Room".yellow)
        socket_rooms.userLeaveRoomByUserId(value.userId,value.room);
      }
      const user = socket_rooms.userJoinRoom(socket.id, value.userId, value.room);
      socket.join(user.room);

      const users = socket_rooms.getRoomUsers(user.room)
      console.log("[SOCKET - CHAT] -> users in the Room".yellow)
      console.log(users)
    }
    else{
      console.log("[SOCKET - SERVER] -> user connect to Server Room".yellow)

      const existUser = socket_rooms.getUserByUserIdAndRoom(value.userId, "server")
      if(existUser){
        console.log("[SOCKET - SERVER] -> renovation users info in the Room".yellow)
        socket_rooms.userLeaveRoomByUserId(value.userId,"server");
      }
      
      const user = socket_rooms.userJoinRoom(socket.id, value.userId, "server");
      socket.join(user.room);

      const users = socket_rooms.getRoomUsers(user.room)
      console.log("[SOCKET - SERVER] -> users in the Room".yellow)
      console.log(users)
    
    }
    
  });

  socket.on('leaveRoom', ( room: string ) => {   
    if(room){
      const existUser = socket_rooms.getUserBySocketIdAndRoom(socket.id, room)
      if(existUser){
        const users = socket_rooms.userLeaveRoomBySocketId(socket.id,room);
        console.log("[SOCKET - CHAT] -> user leave room".yellow)
        console.log(users)
      }
    }
    else{
      const existUser = socket_rooms.getUserBySocketIdAndRoom(socket.id, "server")
      if(existUser){
        const users = socket_rooms.userLeaveRoomBySocketId(socket.id,"server");
        console.log("[SOCKET - SERVER] -> user leave room".yellow)
        console.log(users)
      }
    }
    
    
  });

  // Listen for chatMessage
  socket.on('sendMessage', ( message: any ) => {
    const user = socket_rooms.getUserBySocketId(socket.id);
    if(user){
      console.log("[SOCKET - CHAT] -> new message from ".yellow + user.userId)
      var data={
        conversationId: user.room,
        sender: user.userId,
        text: message.text,
        createdAt: new Date()
      }
      console.log("[SOCKET - CHAT] -> emit to users in room".yellow)
      io.to(user.room).emit('receiveMessage', data);
    }
  });

  socket.on('sendNotification', ( notification: any ) => {
    console.log("[SOCKET - SERVER] -> send notification to user ".yellow + notification.to)
    const user = socket_rooms.getUserByUserIdAndRoom(notification.to, "server");
    if(user){
      console.log("[SOCKET - SERVER] -> send notification to socket :".yellow + user.socketId)
    
      io.to(user.socketId).emit('receiveNotification', notification);
    }

  });

  // Game 
  socket.on("waiting",async ( id: string, serverUrl: string )=> {
    const result = await gameService.putPlayerInWaiting(id); //this returns an id to a game that can either have 2 players or 1
    
    //console.log(result);
    const roomName= JSON.stringify(result._id)
    socket.join(roomName)

    if(result.full===true)
    {
      const playersInfo_ = await gameService.playersInfo(result,serverUrl);
      const data={
        game:result,
        playersInfo:playersInfo_
      }
      io.emit("readyQuestion", data);
    }
    else{socket.emit('waiting list');}
  });

  socket.on("start game",async (game: any)=> {
    const roomName= JSON.stringify(game.id)
    socket.to(roomName).emit("start", game);
  }); 

  socket.on("end turn",async (game: any)=> {
    const streamUpdate = await gameService.playPiece(game)
    const roomName= JSON.stringify(game.id)
    
    socket.to(roomName).emit("new turn",game);
    console.log(streamUpdate.roomName)
    io.to(streamUpdate.roomName).emit('update',streamUpdate)
  }); 

  socket.on("winner",async (game: any, winnerId: string)=> {
    console.log("winner", winnerId);

    await gameService.finishGame(game, winnerId);
    
    const roomName= JSON.stringify(game.id)
    socket.to(roomName).emit("loser");
    
    const streamName= JSON.stringify('stream' + game.id)
    console.log('endStream:', streamName)
    io.emit('endStream',streamName);
  }); 

  socket.on("quit",async (game: any, quitterId: string)=> {
    console.log("user quit", quitterId);

    await gameService.quitGame(game, quitterId);
    
    const roomName= JSON.stringify(game.id)
    socket.to(roomName).emit("winner");

    const streamName= JSON.stringify('stream' + game.id)
    console.log('endStream:', streamName)
    io.emit('endStream',streamName);
  }); 

  socket.on("customGame",async (data: any, serverUrl: string )=> {
    console.log("new custom game");

    const result = await gameService.customGame(data);
    
    if(result === null)
    {  
      console.log('error creating custom game')
      io.emit("playerOccupied", data);
    }
    else{
      const playersInfo_ = await gameService.playersInfo(result,serverUrl);
      data={
        game:result,
        playersInfo:playersInfo_
      }
      console.log(data)
      io.emit("readyQuestion", data);
    }
  }); 

  socket.on('ready',(game: any)=>{
    const roomName= JSON.stringify(game.id)
    socket.join(roomName);
  })

  var timer: any;

  socket.on('leftGame',(game: any)=>{
    var countdown=10
    timer = setInterval(function() {
      countdown--;
      if(countdown === 0){
        const roomName= JSON.stringify(game.id)
        socket.to(roomName).emit("winner");
        socket.disconnect()
      }
    }, 1000);
  })

  /* Stream Game */
  socket.on('requestToWatchStream',async(room: string)=>{
    const game = await gameService.getStreamGame(room)
    if(game){
      socket.join(room);
      io.to(room).emit("answerToWatchStream", 1);
    }else{
      socket.emit("answerToWatchStream", 0);
    }
  })

  socket.on('getStreamGame', async(room: string)=>{
    const game = await gameService.getStreamGame(room)
    socket.join(room);
    io.to(room).emit("update",game);
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    clearInterval(timer)
    console.log("[SOCKET] -> user disconnect".yellow)
  });
});


// start server
http.listen(variables.PORT, () => {
  console.log(`\nServer is running on port ${variables.PORT}`.green)
});