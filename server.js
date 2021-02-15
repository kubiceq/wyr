
const defaultOtazky = [
    "Hráč so zeleným pásikom môže kliknúť na kartu a vybrať ďalšiu kartu",
    "Ak niekto uvidí na karte text: Body Content, môže skúsiť Synchronizuj na hornej lište",
    "Vyberte si otázky v sekcií Iné Balíčky"
]

var pocitadla = [];
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

const botName = 'RoboAdmin';//netreba

// Run when client connects
io.on('connection', socket => {
  _socket = socket;
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    roomdata.joinRoom(socket, user.room); //pripoji sa do miestnosti
    roomdata.set(socket, "gamedata", {counter:0, ktoJeNaTahu:0,otazky: defaultOtazky});
      //prida objekt s pocitadlami, ak uz pre danu izbu neexistuje
      pridajPocitadloPreMiestnost(user.room);
      //nastavi otazky na zaciatok iba ak sa pripojil prvy hrac
      socket.emit('setOtazok',  titulnaOtazka("Novy Set",user.room));
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
    var merace = roomdata.get(socket,'gamedata');
    //poslem novu otazku
    io.to(user.room).emit('otazka', novaOtazka(user.room));

    //zmenim kto je na tahu
    var ktoJeNaTahu = merace.ktoJeNaTahu;
    ktoJeNaTahu = ktoJeNaTahu + 1;
    if (ktoJeNaTahu === getNumberOfRoomUsers(user.room)) {
      ktoJeNaTahu = 0;
    }
    jeNaTahu(user.room, ktoJeNaTahu);
    merace.ktoJeNaTahu = ktoJeNaTahu;
    roomdata.set(socket,'gamedata',merace);
    console.log('merace',merace);
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });


  socket.on('setOtazok', msg => {
    const user = getCurrentUser(socket.id);
    var merace = roomdata.get(socket, 'gamedata');

    if (msg === "prvySetOtazok") {
        merace.otazky = getOtazky('prvySetOtazok');
    }
    else if (msg === "druhySetOtazok") {
        merace.otazky = getOtazky('druhySetOtazok');
    }
    else if (msg === "tretiSetOtazok") {
        merace.otazky = getOtazky('tretiSetOtazok');
    }
    else if (msg === "stvrtySetOtazok") {
      merace.otazky = getOtazky('stvrtySetOtazok');
    }
    else if (msg === "mLTdirty") {
      merace.otazky = getOtazky('mLTdirty');
    }
    else if (msg === "tagFriend1") {
      merace.otazky = getOtazky('tagFriend1');
    }
    io.to(user.room).emit('setOtazok',  titulnaOtazka("Novy Set",user.room));


    roomdata.set(socket,'gamedata',merace);


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
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} nas opustil/a`)
      );

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
function novaOtazka(room) {

  //najdi udaje pre konkretnu miestnost
  var merac = roomdata.get(_socket,'gamedata');

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
  roomdata.set(_socket,'gamedata',merac);




  //return udaje pre otazku
  return {pom, counter, dlzka};
}

//pri pouziti noveho balicku vrati otazku so specifickym nazvom a nastavi counter na 0
function titulnaOtazka(titulok,room) {
  setCounterIzba(room,0);
  var counter = 0;
  var dlzka = roomdata.get(_socket,'gamedata').otazky.length;
  var pom = titulok;
  return {pom, counter, dlzka};
}

function getPocitadla(room){
 return pocitadla.find(pocitadla => pocitadla.room === room);
}

function setPocitadlo(room, counter, ktoJeNaTahu ){
const pom = pocitadla.find(pocitadlo => pocitadlo.room === room);
pom.counter = counter;
pom.ktoJeNaTahu = ktoJeNaTahu;
}

function pridajPocitadloPreMiestnost(room){
  const pom = pocitadla.find(pocitadlo => pocitadlo.room === room);
  if (pom === undefined) {
    pocitadla.push({
      room : room,
      counter: 0,
      ktoJeNaTahu: 0,
      otazky:defaultOtazky
    })
  }
}


function setOtazkyIzba(otazky,room) {
  var index = pocitadla.findIndex(poc => poc.room === room);
  pocitadla[index].otazky = otazky;
}

function getOtazkyIzba(room) {
  var index = pocitadla.findIndex(poc => poc.room === room);
  return pocitadla[index].otazky;
}

function setCounterIzba(room,_counter) {
  var index = pocitadla.findIndex(poc => poc.room === room);
  pocitadla[index].counter = _counter;
}





const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
