import bcrypt = require('bcryptjs');

import db from '../../_helpers/db';
import Role from '../../_helpers/role';

import friendService from '../friends/friends.service';
import MessageService from '../chat/messenger.service';

const User = db.User;
const RefreshToken = db.RefreshToken;


const updateTemporary = async(id: string, userParam: any) => {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    userParam.password = bcrypt.hashSync(userParam.password, 10)

    console.log(userParam)
    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

const searchUser = async (id: string, username: string, fullUrl: string) => {
    var query = { $or: [{ username: { $regex: username, $options: 'i' } }, { firstname: { $regex: username, $options: 'i' } }, { lastname: { $regex: username, $options: 'i' } }], $and: [{ role: { $regex: Role.Player, $options: 'i' } }]}
    
    var users = await User.find(query);

    return users.map((x : any) => {
        x.avatar = fullUrl + x.avatar
        return basicDetails(x);
    });
}

const getAll = async (fullUrl: string) => {
    const users = await User.find({role : Role.Player});
    return users.map((x:any) => {
        x.avatar = fullUrl + x.avatar
        return basicDetails(x);
    });
}

const getById = async (id:string) => {
    const user = await getUser(id);
    return basicDetails(user);
}

const getWallOfFame = async (fullUrl: string) => {
    const users = await db.User.find({ role: Role.Player }).sort({ wins: -1 });
    return users.map((x:any) => {
        x.avatar = fullUrl + x.avatar
        return basicDetails(x);
    });
}
const _delete = async (id:string) => {

    await RefreshToken.findOneAndRemove({user: id});

    const user = await getUser(id);
    var friendsRequestsReceived: string[] = user.friendsRequestsReceived;
    var friendsRequestsSend: string[] = user.friendsRequestsSend;
    var friendsList: string[] = user.friendsList;
    
    var i=0;

    for(i=0; i < friendsRequestsReceived.length; i++){
        friendService.cancelRequestFriend(id,friendsRequestsReceived[i])
    }

    for(i=0; i < friendsRequestsSend.length; i++){
        friendService.answerRequestFriend(id,friendsRequestsSend[i],0)
    }

    for(i=0; i < friendsList.length; i++){
        friendService.removeFriend(id,friendsList[i])
    }

    const conversation = await MessageService.getConversation(id,"");
    if(conversation){
        const conversationId = conversation.id;
        MessageService.deleteConversation(conversationId)
    }
        
    await User.findByIdAndRemove(id);
}

// HELP FUNCTIONS 
const getUser = async (id: string) => {
    if (!db.isValidId(id)) throw 'User not found';
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

function basicDetails(user: any) {
    const { avatar, id, username, email, password, firstname, lastname, role, wins, losses, temporary, level, xp } = user;
    return { avatar, id, username, email, password, firstname, lastname, role, wins, losses, temporary, level, xp };
}

export default {
    updateTemporary,
    searchUser,
    getAll,
    getById,
    getWallOfFame,
    delete: _delete
};