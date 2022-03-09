const users: any[] = [];

// Join user to room
const userJoinRoom = (socketId: string, userId: string, room: string) => {
  const user = { socketId, userId, room };

  users.push(user);

  return user;
}

// User leaves room by socket id
const userLeaveRoomBySocketId = (socketId: string, room: string) => {
  const index = users.findIndex(user => user.socketId === socketId && user.room === room);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const userLeaveRoomByUserId = (userId: string, room: string) => {
  const index = users.findIndex(user => user.userId === userId && user.room === room);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get current user by socket id
const getUserBySocketId = (socketId: string) => {
  return users.find(user => user.socketId === socketId);
}

// Get current user by socket id and room   
const getUserBySocketIdAndRoom = (socketId: string, room: string) => {
  return users.find(user => user.socketId === socketId && user.room === room);
} 

// Get current user by user id  
const getUserByUserId = (userId: string) => {
  return users.find(user => user.userId === userId);
}

// Get current user by user id and room   
const  getUserByUserIdAndRoom = (userId: string, room: string) => {
  return users.find(user => user.userId === userId && user.room === room);
} 

// Get room users
const getRoomUsers = (room: string) => {
  return users.filter(user => user.room === room);
}

export default{
  userJoinRoom,
  userLeaveRoomBySocketId,
  userLeaveRoomByUserId,
  
  getUserBySocketId,
  getUserByUserId,

  getUserBySocketIdAndRoom,
  getUserByUserIdAndRoom,
  
  getRoomUsers
};