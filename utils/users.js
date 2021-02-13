const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room, jeNaTahu };
  user.jeNaTahu = false;
  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function getNumberOfRoomUsers(room){
  let pom = users.filter((user => user.room === room)).length;
  console.log("numofusers");
  console.log(pom);
  return pom;
}

function jeNaTahu(room,index){
  let poleHracov = [];
  for (hrac of users) {
    if (hrac.room === room) {
      poleHracov.push(hrac);
    }
  }

  id = poleHracov[index].id;
  for (hrac of poleHracov) {
    if(hrac.id === id){
      hrac.jeNaTahu = true;
    }
    else {
      hrac.jeNaTahu = false;
    }
  }
}

function getIndexPolaIzba(room, hracId){
  let poleHracov = [];
  for (hrac of users) {
    if (hrac.room === room) {
      poleHracov.push(hrac);
    }
  }
  return poleHracov.findIndex(user => user.id === hracId);
}



module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  jeNaTahu,
  getNumberOfRoomUsers,
  getIndexPolaIzba
};
