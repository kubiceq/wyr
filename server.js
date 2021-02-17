
const defaultOtazky = [
    "Hráč so zeleným pásikom môže kliknúť na kartu a vybrať ďalšiu kartu",
    "Vyberte si otázky v sekcií Iné Balíčky",
    "V Kanade žije prekvapivo málo ľudí"
]


const R = require('ramda');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
var roomdata = require('roomdata'); //
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  jeNaTahu,
  getNumberOfRoomUsers,
  getIndexPolaIzba
} = require('./utils/users');
const getOtazky = require('./src/otazky/otazky');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
var _socket;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  _socket = socket;
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    roomdata.joinRoom(socket, user.room); //pripoji sa do miestnosti
    roomdata.set(socket, "gamedata", {counter:0, ktoJeNaTahu:0,otazky: R.clone(defaultOtazky)});

      //nastavi otazky na zaciatok iba ak sa pripojil prvy hrac
      socket.emit('setOtazok',  titulnaOtazka("Novy Set",socket));
      //nastavi na jeNaTahu toho, kto sa poslendny pripoji
      jeNaTahu(user.room, getNumberOfRoomUsers(user.room)-1);
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
  });

  //pri dalsej otazke sa vygeneruje nahodne cislo, vezme sa otazka a pomenia sa indexy
  socket.on('otazka', msg => {
    const user = getCurrentUser(socket.id);
    // if (roomdata.get(socket,'gamedata') === undefined){
    //     //   user.room = 'default';
    //     //   user.id = 'default';
    //     //   user.jeNaTahu = false;
    //     //
    //     // }
    var merace = roomdata.get(socket,'gamedata');

    //poslem novu otazku
    io.to(user.room).emit('otazka', novaOtazka(user.room,socket));
    //zmenim kto je na tahu
    var ktoJeNaTahu = merace.ktoJeNaTahu;
    ktoJeNaTahu = ktoJeNaTahu + 1;
    if (ktoJeNaTahu === getNumberOfRoomUsers(user.room)) {
      ktoJeNaTahu = 0;
    }
    jeNaTahu(user.room, ktoJeNaTahu);
    merace.ktoJeNaTahu = ktoJeNaTahu;

    roomdata.set(socket,'gamedata',merace);

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    console.log(roomdata.get(socket,'gamedata'));
  });


  socket.on('setOtazok', msg => {
    const user = getCurrentUser(socket.id);
    var merace = roomdata.get(socket, 'gamedata');
  let pomMerace = [];
    if (msg === "prvySetOtazok") {
      let pom = getOtazky('prvySetOtazok');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }
    else if (msg === "druhySetOtazok") {
      let pom = getOtazky('druhySetOtazok');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }
    else if (msg === "tretiSetOtazok") {
      let pom = getOtazky('tretiSetOtazok');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }
    else if (msg === "stvrtySetOtazok") {
      let pom = getOtazky('stvrtySetOtazok');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }
    else if (msg === "mLTdirty") {
      let pom = getOtazky('mLTdirty');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }
    else if (msg === "tagFriend1") {
      let pom = getOtazky('tagFriend1');
      let pom2 = R.clone(pom);
      console.log(pom === pom2);
      merace.otazky = pom2;
    }

    roomdata.set(socket,'gamedata',merace);

    io.to(user.room).emit('setOtazok',  titulnaOtazka("Nový Set",socket));

  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  socket.on('refresh',msg =>{
    console.log('refresh');
    const user = getCurrentUser(socket.id);
    let pom = 'please';
    socket.to(user.room).emit('refresh',pom);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {

      roomdata.leaveRoom(socket)
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
function novaOtazka(room,socket) {

  //najdi udaje pre konkretnu miestnost
  var merac = roomdata.get(socket,'gamedata');

  //vloz udaje do konkretnych premennych a urob co treba
  var counter = merac.counter + 1;
  var index = getRandomInt(0,merac.otazky.length);
  var dlzka = merac.otazky.length;

  var otazkyIzba = merac.otazky;
  var pom = merac.otazky[index];

  //uprav udaje pre objekt merac, aby sme ho mohli zapisat nazad do pola
  otazkyIzba.splice(index,1);
  merac.counter = counter;
  merac.otazky = otazkyIzba;
  roomdata.set(socket,'gamedata',merac);




  //return udaje pre otazku
  return {pom, counter, dlzka};
}

//pri pouziti noveho balicku vrati otazku so specifickym nazvom a nastavi counter na 0
function titulnaOtazka(titulok,socket) {
  let counter = 0;
  let gamedata = roomdata.get(socket,'gamedata');
  gamedata.counter = 0;
  var dlzka = gamedata.otazky.length;
  var pom = titulok;
  roomdata.set(socket,'gamedata',gamedata);
  return {pom, counter, dlzka};
}




const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
