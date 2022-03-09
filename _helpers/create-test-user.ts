import bcrypt from 'bcryptjs';
import db from './db';

import Role from '../_helpers/role';

export default async function createTestUser() {
    // create test user if the db is empty
    var moderator_password: string = '!moderator!';
    const moderator = new db.User({
        username: 'moderator',
        email: 'moderator@connect4.com',
        firstname: 'Moderator',
        lastname: 'Name',
        password: bcrypt.hashSync(moderator_password, 10),
        role:  Role.Moderator
    });

    var player_password: string = '!player!';
    const player = new db.User({
        username: 'player',
        email: 'player@connect4.com',
        firstname: 'Player',
        lastname: 'Name',
        password: bcrypt.hashSync(player_password, 10),
        role:  Role.Player
    });

    if ((await db.User.countDocuments({})) === 0) {
        await moderator.save();
        await player.save();
        console.log(`\nTest Users Created:`.yellow)
    }
    else{
        console.log(`\nTest Users:`.yellow)
    }

    var message: string = "";

    var username: string = moderator.username
    if(await db.User.findOne({ username })){
        message += "Moderator: Username = " + moderator.username + " || Password = " + moderator_password + " ";
    }

    username = player.username
    if(await db.User.findOne({ username })){
        message += "\nPlayer:    Username = " + player.username + " || Password = " + player_password + " \n";
    }

              

    console.log(message.blue)
}