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

function jeNaTahu(index){
  console.log(index);
  id = users[index].id;
  for (hrac of users) {
    if(hrac.id === id){
      hrac.jeNaTahu = true;
    }
    else {
      hrac.jeNaTahu = false;
    }
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  jeNaTahu,
  getNumberOfRoomUsers
};
