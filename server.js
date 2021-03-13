
const defaultOtazky = [
  " Would you rather be a detective or a pilot?",
  " Would you rather go skiing or go to a water park?",
  " Would you rather fly a kite or swing on a swing?",
  " Would you rather dance or sing?",
  " Would you rather play hide and seek or dodgeball?",
  " Would you rather be incredibly funny or incredibly smart?",
  " Would you rather become five years older or two years younger?",
  " Would you rather have a full suit of armor or a horse?",
  " Would you rather be a master at drawing or be an amazing singer?",
  " Would you rather be a wizard or a superhero?",
  " Would you rather sail a boat or ride in a hang glider?",
  " Would you rather brush your teeth with soap or drink sour milk?",
  " Would you rather be a famous inventor or a famous writer?",
  " Would you rather do school work as a group or by yourself?",
  " Would you rather be able to do flips and backflips or break dance?",
  " Would you rather see a firework display or a circus performance?",
  " Would you rather it be warm and raining or cold and snowing today?",
  " Would you rather be able to create a new holiday or create a new sport?",
  " Would you rather only be able to walk on all fours or only be able to walk sideways like a crab?",
  " Would you rather start a colony on another planet or be the leader of a small country on Earth?"
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
const io = socketio(server, {
  pingInterval: 6000, // How many ms before the client sends a new ping packet
  pingTimeout: 15000, // How many ms without a pong packet to consider the connection closed.
});;


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    roomdata.joinRoom(socket, user.room); //pripoji sa do miestnosti


      //nastavi otazky na zaciatok iba ak sa pripojil prvy hrac
    if (getNumberOfRoomUsers(room) > 1){
      let dataIzby = roomdata.get(socket,'gamedata');
      socket.emit('setOtazok',{pom: dataIzby.aktualnaOtazka, counter: dataIzby.counter, dlzka: dataIzby.otazky.length, typHry: dataIzby.typHry })
    }
    else {
      roomdata.set(socket, "gamedata", {counter:0, ktoJeNaTahu:0,otazky: R.clone(defaultOtazky), aktualnaOtazka: "", typHry: 'Would You Rather'});
      socket.emit('setOtazok',  titulnaOtazka("New Set",socket));
      jeNaTahu(user.room, getNumberOfRoomUsers(user.room)-1);
    }



      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
  });


  //pri dalsej otazke sa vygeneruje nahodne cislo, vezme sa otazka a pomenia sa indexy
  socket.on('otazka', msg => {
    const user = getCurrentUser(socket.id);
    if (user === undefined){

    }
    else {
      const user = getCurrentUser(socket.id);
      let merace = roomdata.get(socket, 'gamedata');
      let aktualnaOtazka = novaOtazka(user.room, socket);
      merace.aktualnaOtazka = aktualnaOtazka.pom;

      //poslem novu otazku
      io.to(user.room).emit('otazka', aktualnaOtazka);
      //zmenim kto je na tahu
      let ktoJeNaTahu = merace.ktoJeNaTahu;
      ktoJeNaTahu = ktoJeNaTahu + 1;
      if (ktoJeNaTahu === getNumberOfRoomUsers(user.room)) {
        ktoJeNaTahu = 0;
      }
      jeNaTahu(user.room, ktoJeNaTahu);
      merace.ktoJeNaTahu = ktoJeNaTahu;

      roomdata.set(socket, 'gamedata', merace);

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
      console.log(roomdata.get(socket, 'gamedata'));
    }
  });

//pri vybere noveho setu otazok natiahnem otazky a vytvorim deep clone
  socket.on('setOtazok', msg => {
    const user = getCurrentUser(socket.id);
    if (user === undefined){

    }
    {
      var merace = roomdata.get(socket, 'gamedata');
      if (msg === "prvySetOtazok") {
        let pom = getOtazky('prvySetOtazok');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      } else if (msg === "druhySetOtazok") {
        let pom = getOtazky('druhySetOtazok');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      } else if (msg === "tretiSetOtazok") {
        let pom = getOtazky('tretiSetOtazok');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      } else if (msg === "stvrtySetOtazok") {
        let pom = getOtazky('stvrtySetOtazok');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      } else if (msg === "mLTdirty") {
        let pom = getOtazky('mLTdirty');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Most Likely To';
      } else if (msg === "tagFriend1") {
        let pom = getOtazky('tagFriend1');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Tag A Friend';
      }
        else if (msg === "patka") {
          let pom = getOtazky('patka');
          let pom2 = R.clone(pom);
          console.log(pom === pom2);
          merace.otazky = pom2;
          merace.typHry = 'Would You Rather';
      }
      else if (msg === "childrenMegapackWouldYouRather") {
        let pom = getOtazky('childrenMegapackWouldYouRather');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      }
      else if (msg === "truthOrDare1") {
        let pom = getOtazky('truthOrDare1');
        let pom2 = R.clone(pom);
        console.log(pom === pom2);
        merace.otazky = pom2;
        merace.typHry = 'Would You Rather';
      }

      roomdata.set(socket, 'gamedata', merace);

      io.to(user.room).emit('setOtazok', titulnaOtazka("New Set", socket));
    }
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
    if (user === undefined){

    }
    else {
    if (user.jeNaTahu && getNumberOfRoomUsers(user.room) > 0){
      let merace = roomdata.get(socket,'gamedata');
      merace.ktoJeNaTahu =getRandomInt(0,getNumberOfRoomUsers(user.room));
      jeNaTahu(user.room, merace.ktoJeNaTahu);
      roomdata.set(socket,'gamedata',merace);

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

    if (user) {
      roomdata.leaveRoom(socket)
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
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
  let typHry = gamedata.typHry;
  roomdata.set(socket,'gamedata',gamedata);
  return {pom, counter, dlzka, typHry};
}

function glupa() {

}



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
