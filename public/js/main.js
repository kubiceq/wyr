const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg){
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// vypluje userov do html
//okrem toho oznaci momentalne aktivneho usera a tomu povoli stlacit kartu, ostatnym to zakaze
function outputUsers(users) {
  userList.innerHTML = '';
  const kopka1 = document.getElementById('kopka1Btn');
  users.forEach(user=>{
    const li = document.createElement('li');

    if (user.jeNaTahu) {
        li.classList.toggle("aktivnyUser");
    }

    li.innerText = user.username;
    userList.appendChild(li);
  });
  
  const thisUser = users.find(user => user.id === socket.id);
  if (thisUser.jeNaTahu) {
    kopka1.disabled = false
  }
  else {
    kopka1.disabled = true;
  }
 }

 function novaOtazka() {
   console.log("niekto si vytiahol kartu");
   socket.emit('otazka','next');
 }

function generujIdIzby(length){
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }

     socket.emit('novaIzba',result);
     console.log(result);
     return result;
   }



 socket.on('otazka', otazka =>{

   console.log(otazka);
   const otazkahtml = document.getElementById('otazka');
   const pocitadlohtml = document.getElementById('counter');
   otazkahtml.innerText = otazka.pom;
   pocitadlohtml.innerText = "Otázka: " + otazka.counter + " Zostáva: " + otazka.dlzka;

 });

 function vyberSetOtazok(otazky){
   socket.emit('setOtazok', otazky);
 }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
