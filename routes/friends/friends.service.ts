import db from '../../_helpers/db';

import Role from '../../_helpers/role';

import MessageService from '../chat/messenger.service';

const User = db.User;

const getListUsers = async (id: string, fullUrl: string) => {
    var users = await User.find({ role: Role.Player });

    var index = users.findIndex((user: any) => user.id === id)
    if (index > -1) {
        users.splice(index, 1);
    }

    return users.map((x: any) => {
        x.avatar = fullUrl + x.avatar
        return friendshipInfo(x, id);
    });
}

const searchUser = async (id: string, username: string, fullUrl: string) => {
    var query = { $or: [{ username: { $regex: username, $options: 'i' } }, { firstname: { $regex: username, $options: 'i' } }, { lastname: { $regex: username, $options: 'i' } }], $and: [{ role: { $regex: Role.Player, $options: 'i' } }]}
    var users = await User.find(query);

    var index = users.findIndex((user: any) => user.id === id)
    if (index > -1) {
        users.splice(index, 1);
    }

    return users.map((x: any) => {
        x.avatar = fullUrl + x.avatar
        return friendshipInfo(x, id);
    });
}

const sendRequestFriend = async (id: string, friendId: string) => {

    if (id != friendId && (id.length != 0 || friendId.length != 0)) {
        const user = await getUser(id);
        const friend = await getUser(friendId);

        if (user.friendsRequestsSend.indexOf(friendId) == -1) {
            user.friendsRequestsSend.push(friendId)
        }

        if (friend.friendsRequestsReceived.indexOf(id) == -1) {
            friend.friendsRequestsReceived.push(id)
        }

        // save user
        await user.save();

        // save friend
        await friend.save();
    }
    else {
        console.log("ERROR")
    }

}

const cancelRequestFriend = async (id: string, friendId: string) => {
    if (id != friendId && (id.length != 0 || friendId.length != 0)) {
        const user = await getUser(id);
        const friend = await getUser(friendId);

        var index_user: number = user.friendsRequestsSend.indexOf(friendId);
        if (index_user > -1) {
            user.friendsRequestsSend.splice(index_user, 1);
        }

        var index_friend: number = friend.friendsRequestsReceived.indexOf(id);
        if (index_friend > -1) {
            friend.friendsRequestsReceived.splice(index_friend, 1);
        }

        // save user
        await user.save();

        // save friend
        await friend.save();
    }
    else {
        console.log("ERROR")
    }

}

const getRequestsFriendsSend = async (id: string, fullUrl: string) => {
    const user = await getUser(id);
    const friendList = [];

    for (var i = 0; i < user.friendsRequestsSend.length; i++) {
        const friend = await getUser(user.friendsRequestsSend[i]);
        friend.avatar = fullUrl + friend.avatar;
        friendList.push(details(friend, 1))
    }

    return friendList;
}

const getRequestsFriendsReceived = async (id: string, fullUrl: string) => {
    const user = await getUser(id);
    const friendList = [];

    for (var i = 0; i < user.friendsRequestsReceived.length; i++) {
        const friend = await getUser(user.friendsRequestsReceived[i]);
        friend.avatar = fullUrl + friend.avatar;
        friendList.push(details(friend, 2))
    }

    return friendList;
}

const answerRequestFriend = async (id: string, friendId: string, type:number) => {

    if (id != friendId && (id.length != 0 || friendId.length != 0)) {
        const user = await getUser(id);
        const friend = await getUser(friendId);

        var index_user: number = -1;
        var index_friend: number = -1;

        switch (type) {
            //REJECT
            case 0:
                index_user = user.friendsRequestsReceived.indexOf(friendId);
                if (index_user > -1) {
                    user.friendsRequestsReceived.splice(index_user, 1);
                }

                index_friend = friend.friendsRequestsSend.indexOf(id);
                if (index_friend > -1) {
                    friend.friendsRequestsSend.splice(index_friend, 1);
                }

                break;

            //ACCEPT
            case 1:
                index_user = user.friendsRequestsReceived.indexOf(friendId);
                if (index_user > -1) {
                    user.friendsRequestsReceived.splice(index_user, 1);
                }

                index_friend = friend.friendsRequestsSend.indexOf(id);
                if (index_friend > -1) {
                    friend.friendsRequestsSend.splice(index_friend, 1);
                }

                if (index_user != -1 && index_friend != -1) {
                    user.friendsList.push(friendId)
                    friend.friendsList.push(id)
                    MessageService.createConversation(id,friendId)
                }
                
                break;
        }

        // save user
        await user.save();

        // save friend
        await friend.save();
    }
}

const removeFriend = async (id: string, friendId:string) => {

    if (id != friendId && (id.length != 0 || friendId.length != 0)) {
        const user = await getUser(id);
        const friend = await getUser(friendId);

        if (verifyAreFriends(user.friendsList, friendId) && verifyAreFriends(friend.friendsList, id)) {
            var index_user: number = user.friendsList.indexOf(friendId);
            if (index_user > -1) {
                user.friendsList.splice(index_user, 1);
            }

            var index_friend: number = friend.friendsList.indexOf(id);
            if (index_friend > -1) {
                friend.friendsList.splice(index_friend, 1);
            }

            // save user
            await user.save();

            // save friend
            await friend.save();
            
            const conversation = await MessageService.getConversation(id,friendId);
            console.log(conversation)
            if(conversation){
                const conversationId = conversation.id;
                MessageService.deleteConversation(conversationId)
            }
        }
    }

}

const getListFriends = async (id: string, fullUrl: string) => {
    const user = await getUser(id);
    const friendList = [];

    for (var i = 0; i < user.friendsList.length; i++) {
        if (user.friendsList[i].length != 0) {
            const friend = await getUser(user.friendsList[i]);
            friend.avatar = fullUrl + friend.avatar;
            friendList.push(details(friend, 3))
        }
    }

    return friendList;
}

const getListFriendsOnline = async (id: string, fullUrl: string) => {
    const user = await getUser(id);
    const friendList = [];

    for (var i = 0; i < user.friendsList.length; i++) {
        if (user.friendsList[i].length != 0) {
            const friend = await getUser(user.friendsList[i]);
            if(friend.state > 0 && friend.state < 4){
                friend.avatar = fullUrl + friend.avatar;
                friendList.push(details(friend, 3))
            }
        }
    }

    return friendList;
}

/* Game */

const getListGameRequests = async (id: string, fullUrl: string) => {
    const user = await getUser(id);
    const gameList = [];

    for (var i = 0; i < user.friendsGameRequests.length; i++) {
        if (user.friendsGameRequests[i].length != 0) {
            const friend = await getUser(user.friendsGameRequests[i]);
            if(friend.state=1){
                friend.avatar = fullUrl + friend.avatar;
                gameList.push(details(friend, 3))
            }
        }
    }

    console.log("getListGameRequests"+JSON.stringify(gameList))
    return gameList;
}

const sendRequestForGame = async (id: string, friendId: string) => {
    console.log('request game')
    if (id != friendId && (id.length != 0 || friendId.length != 0)) {
        const user = await getUser(id);
        const friend = await getUser(friendId);

        if (friend.friendsGameRequests.indexOf(id) == -1) {
            friend.friendsGameRequests.push(id)
        }
        await friend.save();
    }
    else {
        console.log("ERROR")
    }
}

const answerRequestGame = async (id: string, friendId: string) => {
    const user = await getUser(id);
    var index_friend: number = user.friendsGameRequests.indexOf(friendId);
    if (index_friend > -1) {
        user.friendsGameRequests.splice(index_friend, 1);
    }

    await user.save();
}

async function getInfoForGame(player1: string, player2: string) {
    const player1_ = await db.User.findById(player1);
    const player2_ = await db.User.findById(player2);
    
    var info = []
    
    info.push(details(player1_,3))
    info.push(details(player2_,3))
    
    //console.log(info)
    return details;
}

/* HELP FUNCTIONS */
async function getUser(id: string) {
    if (!db.isValidId(id)) throw 'User not found';

    const user = await User.findById(id);

    if (!user) throw 'User not found';

    return user;
}

function details(user: any, type: number) {
    const { avatar, id, firstname, lastname, username, wins, losses } = user;
    var friend = -1;
    switch (type) {
        case 0: // are not friends there are no friend requests sent or received
            friend = 0;
            return { friend, avatar, id, firstname, lastname, username };
            break;
        case 1: // are not friends but there is a friend request sent
            friend = 1;
            return { friend, avatar, id, firstname, lastname, username };
            break;
        case 2: // are not friends but there is a friend request received
            friend = 2;
            return { friend, avatar, id, firstname, lastname, username };
            break;
        case 3: //are friends
            friend = 3;
            return { friend, avatar, id, firstname, lastname, username, wins, losses };
            break;
    }

}

function friendshipInfo(user: any, friendId: string) {

    var friendsRequestsReceived: number = user.friendsRequestsReceived.indexOf(friendId)
    var friendsRequestsSend: number = user.friendsRequestsSend.indexOf(friendId)
    var friendsList: number = user.friendsList.indexOf(friendId)

    if (friendsRequestsReceived === -1 && friendsRequestsSend === -1 && friendsList === -1) {
        return details(user, 0);
    }
    if (friendsRequestsReceived > -1) {
        return details(user, 1);
    }
    if (friendsRequestsSend > -1) {
        return details(user, 2);
    }
    if (friendsList > -1) {
        return details(user, 3);
    }
}

function verifyAreFriends(friendList: Array<string>, userID: string) {
    var value: number = friendList.indexOf(userID)
    if (value == -1) {
        return 0
    }
    else {
        return 1
    }
}

export default  {
    getListUsers,
    searchUser,

    sendRequestFriend,
    cancelRequestFriend,

    getRequestsFriendsSend,
    getRequestsFriendsReceived,

    answerRequestFriend,
    removeFriend,

    getListFriends,
    getListFriendsOnline,

    getListGameRequests,
    sendRequestForGame,
    answerRequestGame,
    getInfoForGame
};