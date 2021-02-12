
let otazky = ["testovacia otazka",
"druha otazka",
"tretia otazka"]



let counter = 0;
let ktoJeNaTahu = 0;

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  jeNaTahu,
  getNumberOfRoomUsers
} = require('./utils/users');
const getOtazky = require('./src/otazky/otazky');



const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'RoboAdmin';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    console.log(user);
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Vitaj v chate'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} sa pripojil/a`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });


      jeNaTahu(getNumberOfRoomUsers(user.room)-1);

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  socket.on('otazka', msg => {
    const user = getCurrentUser(socket.id);
    console.log(msg);
    //io.to(user.room).emit('otazka',getRoomUsers(user.room));//testing potom treba vymenit za spodny
    io.to(user.room).emit('otazka', novaOtazka());
    ktoJeNaTahu = ktoJeNaTahu + 1;
    console.log("ktoJeNaTahu ");
    console.log(ktoJeNaTahu);

    if (ktoJeNaTahu === getNumberOfRoomUsers(user.room)) {
      ktoJeNaTahu = 0;
    }
    jeNaTahu(ktoJeNaTahu)
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  socket.on('novaIzba', msg => {
    console.log(msg);
  });

  socket.on('setOtazok', msg => {
    const user = getCurrentUser(socket.id);
    console.log(msg);
    if (msg === "prvySetOtazok") {
        otazky = getOtazky('prvySetOtazok');
        //io.to(user.room).emit('otazka', titulnaOtazka("Prvy Set"));
    }
    else if (msg === "druhySetOtazok") {
        otazky = getOtazky('druhySetOtazok');
        //io.to(user.room).emit('otazka', titulnaOtazka("Druhy Set"));
    }
    else if (msg === "tretiSetOtazok") {
        otazky = getOtazky('tretiSetOtazok');
      //io.to(user.room).emit('otazka', titulnaOtazka("Treti Set"));
    }
    io.to(user.room).emit('setOtazok',  titulnaOtazka("Novy Set"));

    console.log(otazky);
    //io.to(user.room).emit('otazka', titulnaOtazka("Novy Set"));
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    console.log(msg);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} nas opustil/a`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });

});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//najde nahodnu otazku a vrati otazku, pocet doteraz otazok a pocet vsetkych otazok
function novaOtazka() {
  counter = counter + 1;
  let index = getRandomInt(0,otazky.length);
  let dlzka = otazky.length;
  let pom =  otazky[index];
  otazky.splice(index,1);
  console.log(pom);
  return {pom, counter, dlzka};
}

//pri pouziti noveho balicku vrati otazku so specifickym nazvom a nastavi counter na 0
function titulnaOtazka(titulok) {
  counter = 0;
  let dlzka = otazky.length;
  pom = titulok;
  return {pom, counter, dlzka};
}




const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
