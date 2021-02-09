
let otazky = ["Would you rather Have a dog with a cat’s personality or a cat with a dog’s personality?",
  "If you were reborn in a new life, would you rather be alive in the past or future?",
  "Would you rather eat no candy at Halloween or no turkey at Thanksgiving?",
  "Would you rather date someone you love or date someone who loves you?",
  "Would you rather lose the ability to lie or believe everything you’re told?",
  "Would you rather be free or be totally safe?",
  "Would you rather Eat shit that tasted like chocolate, or eat chocolate that tasted like crap?",
  "Would you rather Look 10 years older from the neck up, or the neck down?",
  "Would you rather Be extremely underweight or extremely overweight?",
  "Would you rather Experience the beginning of planet earth or the end of planet earth?",
  "Would you rather have an incredibly annoying high-pitched voice or a really deep manly voice?",
  "Would you rather have a full-blown moustache for a year or permanently hairy legs for ten years?",
  "Would you rather give up your phone or only wear Crocs for the rest of your life?",
  "Would you rather clog the toilet on a first date or first day at a new job?",
  "Would you rather have an abnormally big toe or an abnormally big ear?",
  "Would you rather be three feet tall or eight feet tall?",
  "Would you rather have to be naked at work for an hour or be dropped off two miles from your house whilst you're naked and you have to try and get home?",
  "Would you rather smell like cheese (which has been left in the sun) or a hamster cage (which hasn't been cleaned for a fortnight)?",
  "Would you rather be a mad genius or popular but dim?",
  "Would you rather a nose that never stops growing or ears that never stop growing?",
  "Would you rather whip or be whipped?",
  "Would you rather have your hair pulled or your back scratched?",
  "Would you rather dominate or be dominated?",
  "Would you rather have a cupboard full of sex toys or kinky outfits?",
  "Would you rather sleep with someone on the first date or wait for six months?",
  "Would you rather have unbelievable sex that lasts ten minutes or average sex that lasts an hour?",
  "Would you rather your partner be kinky or romantic?",
  "Would you rather swallow or spit?",
  "Would you rather have sex with the light on or the light off?",
  "Would you rather have sex in the shower or on the kitchen table?",
  "Would you rather accidentally send a naughty picture to your dad or your boss?",
  "Would you rather give up sex or give up food?",
  "Would you rather walk in on your parents having sex or have them walk in on you having sex?",
  "Would you rather be stuck in a phone box with ten snakes or ten tarantulas?",
  "Would you rather say your ex's name during sex or your partner's best friend's name?",
  "Would you rather have the face of a pensioner but the body of a twenty-year-old or the body of a pensioner and the face of a twenty-year-old?",
  "Would you rather be funny but really stupid or boring but really smart?",
  "Would you rather be famous or rich?",
  "Would you rather find the love of your life or find a million pounds?",
  "Would you rather be able to travel everywhere for free or eat everywhere for free?",
  "Would you rather have arms as long as Mr. Tickle or legs as short as E.T?",
  "Would you rather empty a swimming pool using just a fork or get in a swimming pool for half an hour with a jellyfish?",
  "Would you rather drink soup out of a farmer's welly or from a binman's sock?",
  "Would you rather have no sense of smell or no sense of taste?",
  "Would you rather have your name tattooed on your forehead or have no front teeth?"];
let counter = 0;


const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

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

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Vitajte u nas'));

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
  });

  socket.on('otazka', msg => {
    const user = getCurrentUser(socket.id);
    console.log(msg);
    io.to(user.room).emit('otazka', novaOtazka());
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

function novaOtazka() {
  counter = counter + 1;
  var index = getRandomInt(0,otazky.length);
  let pom =  otazky[index];
  otazky.splice(index,1);
  console.log(pom);
  changeCounter(counter);
  return pom;

}

function changeCounter(position) {
  let pozicia = "Otazka c." +position + " Ostava: " + otazky.length;
}


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
