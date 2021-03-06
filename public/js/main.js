const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL
const {
  username,
  room
} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', {
  username,
  room
});

// Get room and users
socket.on('roomUsers', ({
  room,
  users
}) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  // outputMessage(message);
  //
  // // Scroll down
  // chatMessages.scrollTop = chatMessages.scrollHeight;
});


// Output message to DOM
function outputMessage(message) {
  // const div = document.createElement('div');
  // div.classList.add('message');
  // const p = document.createElement('p');
  // p.classList.add('meta');
  // p.innerText = message.username;
  // p.innerHTML += `<span>${message.time}</span>`;
  // div.appendChild(p);
  // const para = document.createElement('p');
  // para.classList.add('text');
  // para.innerText = message.text;
  // div.appendChild(para);
  // document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// vypluje userov do html
//okrem toho oznaci momentalne aktivneho usera a tomu povoli stlacit kartu, ostatnym to zakaze
function outputUsers(users) {
  userList.innerHTML = '';

  const deck = document.getElementById('deck');
  users.forEach(user => {
    const li = document.createElement('li');

    if (user.jeNaTahu) {
      li.classList.toggle("aktivnyUser");
    }

    li.innerText = user.username;
    userList.appendChild(li);
  });

  const thisUser = users.find(user => user.id === socket.id);
  const deckhtml = document.getElementById('deck');
  if (thisUser.jeNaTahu || thisUser === users[0]) {
    deckhtml.setAttribute('onclick', 'novaOtazka()')
  } else {
    deckhtml.setAttribute('onclick', 'glupa()')
  }

  let dropdownBalicky =[...document.getElementsByClassName('dropdown-item')];
  if (thisUser !== users[0]){
      for (element of dropdownBalicky){
        element.onclick = glupa();
        console.log(element);
      }
  }

}

function novaOtazka() {
  console.log("niekto si vytiahol kartu");
  socket.emit('otazka', 'next');
}

function generujIdIzby(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  socket.emit('novaIzba', result);
  console.log(result);
  return result;
}



socket.on('otazka', otazka => {

  console.log(otazka);
  console.log(otazka.counter);
  const otazkahtml = document.getElementById(`karta-${otazka.counter}`);
  const pocitadlohtml = document.getElementById('counter');
  if (otazkahtml.innerText === null ){
    removeTopCard();
  }
  else {

    if (otazka.dlzka === 0) {
      otazkahtml.innerText = "End";
      removeTopCard();
    } else {
      pocitadlohtml.innerText = "Question: " + otazka.counter + " Left: " + otazka.dlzka;
      otazkahtml.innerText = otazka.pom;
      removeTopCard();
    }
  }
});

socket.on('setOtazok', titulnaOtazka => {

  novyDeck(titulnaOtazka.dlzka,titulnaOtazka.counter,titulnaOtazka.typHry);

  console.log(titulnaOtazka);
  //console.log(titulnaOtazka.counter);
  const otazkahtml = document.getElementById(`karta-${titulnaOtazka.counter}`);
  const pocitadlohtml = document.getElementById('counter');
  otazkahtml.innerText = titulnaOtazka.pom;
  pocitadlohtml.innerText = "Question: " + titulnaOtazka.counter + " Left: " + titulnaOtazka.dlzka;

});

function vyberSetOtazok(otazky) {
  socket.emit('setOtazok', otazky);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//************************************************************************************************************************

var $deck = $('.deck');

window.setTimeout(function() {
  $deck.addClass('is-scattered');
}, 1);

var removeTopCard = function() {
  var $child = $deck.children(':last-child');
  $child.addClass('is-offscreen--l');
  window.setTimeout(function() {
    $child.remove();
  }, 500);
}





function novyDeck(pocetKariet,counter,typHry) {
  document.getElementById('deck').innerHTML = '';

  console.log($deck.innerHTML);

  for (var i = pocetKariet + 1; i >= counter; i--) {
    var $card = $('<div>', {
      html: '<div class="karta" >' +
        '<header class="karta-header">' +
        ` <h3>${typHry}</h3>` +
        '</header>' +
        `<div class="karta-body" id="karta-${i}">` +
        '  Body Content' +
        '</div>' +
        '<footer class="karta-footer">' +
        '  ®ruffaid' +
        '</footer>'
    }).children(1);
    $deck.append($card);

    let  pravidlahtml = document.getElementById('pravidla');
    switch (typHry) {
      case'Would You Rather':
        zmenFarbuPozadia('karta','#F5EFA3') ;
        pravidlahtml.innerHTML =  '  <h3>Rules:</h3>\n' +
                                  '  <p>Player answers his question, then draws card for the next player.</p>';
        break;
      case'Most Likely To':
        zmenFarbuPozadia('karta','#F2BDB3') ;
        pravidlahtml.innerHTML =  '  <h3>Rules:</h3>\n' +
            '  <p>Players have to agree on who is most likely to...(card). </p>';
        break;
      case'Tag A Friend':
        zmenFarbuPozadia('karta','#dffad2');
        pravidlahtml.innerHTML =  '  <h3>Rules:</h3>\n' +
            '  <p>Player answers his question, then draws card for the next player.</p>';
        break;
      case'Truth':
        zmenFarbuPozadia('karta','#bee2f7') ;
        pravidlahtml.innerHTML =  '  <h3>Rules:</h3>\n' +
            '  <p>Tell the truth. </p>';
        break;
      case'Dare':
        zmenFarbuPozadia('karta','#f5bfef') ;
        pravidlahtml.innerHTML =  '  <h3>Rules:</h3>\n' +
            '  <p>Do the dare. </p>';
        break;
      default:
        zmenFarbuPozadia('karta','#F2DBB3');
        pravidlahtml.innerHTML =  '<p>Only player whose name is green can pick next card.</p>' +
                                  '<p>Only admin can choose different packages</p>';
    }
  }
}

function zmenFarbuPozadia(trieda,farba) {
  var objekty = document.getElementsByClassName(trieda);
  for(i = 0; i < objekty.length; i++) {
    objekty[i].style.backgroundColor = farba;
  }
}

function glupa() {

}

function posliAlert(string) {
  alert(string);
}

function refreshAll() {
  socket.emit('refresh','demand');
  location.reload();
  console.log('reload pushed');
}
socket.on('refresh',msg =>{
  console.log('reload',msg);
  location.reload();
});







