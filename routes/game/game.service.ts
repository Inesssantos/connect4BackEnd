import db from '../../_helpers/db';

const User = db.User;
const Game = db.Game;


const putPlayerInWaiting = async (id:string) => {
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    if (user.state != 2) {
        user.state = 2; //puts user in waiting state
        await user.save();
        console.log("user".magenta, id, "putted in waiting room".magenta);
    }
    else{console.log("user".yellow, id, "is already in waiting room".yellow);}

    return await createOrJointGame(user);
}

const createOrJointGame = async (user: any) => {
    var query = { "full": false}
    var games = await db.Game.find(query);

    if(games.length === 0)
    {
        const game = await createNewGame(user);
        return game
    }
    else{
        const game= await checkIfInGame(user)
        if(game != null)
            return game; 

        const resultMatch = await matchMaking(user)
        if(resultMatch === null)
            return await createNewGame(user);
        return resultMatch;
    }
}

const checkIfInGame = async (user: any) => {
    var query = { $or: [{ Player1: { $regex: user._id, $options: 'i' } }, { Player2: { $regex: user._id, $options: 'i' } }],  $and: [{ live: true }]}
    
    var game = await db.Game.findOne(query);

    return game;
}

const createNewGame = async (user:any) => {
    console.log( "\nAdding user to new game : ".green, user._id)

    const gameParams={
        // PLAYER ID
        Player1: user._id,
        levelPlayer1: 1, //mudar depois para o nivel verdadeiro

        // game
        row1:["o","o","o","o","o","o","o"],
        row2:["o","o","o","o","o","o","o"],
        row3:["o","o","o","o","o","o","o"],
        row4:["o","o","o","o","o","o","o"],
        row5:["o","o","o","o","o","o","o"],
        row6:["o","o","o","o","o","o","o"],

        turn:user._id

    }
    const game = new Game(gameParams)
    await game.save()
    return game
}

const matchMaking = async (user:any) => {
    console.log( "\ntrying to match user with existing game ".green, user._id)

    var query = { "full": false}
    var games = await db.Game.find(query);

    for(let i=0; i<games.length; i++){
        var levelDifference = games[i].levelPlayer1 - 1/*user.level*/
        if(levelDifference<=1 && levelDifference>=-1) //they can only have a level difference of 1 level to play
        {
            return await jointGame(games[i], user)
        }
    }

    return null;
}

const jointGame = async (game:any, user:any) => {
    console.log( "\nAdding user to existing game: ".green, user._id)

    game.Player2= user._id
    game.levelPlayer2 = 1/*user.level */
    game.full=true

    await game.save()

    return game
}

const playPiece = async (game_:any) => {
    const game = await Game.findById(game_.id);
    if (!game) throw 'Game not found';


    game.row1=game_.row1;
    game.row2=game_.row2;
    game.row3=game_.row3;
    game.row4=game_.row4;
    game.row5=game_.row5;
    game.row6=game_.row6;

    await game.save()
    return getStreamUpdate(game)
}

const pullPlayerFromWaiting = async (id: string) => {
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    if (user.state != 2) {console.log("user".red, id, "is not in waiting room".red);}
    else{
        user.state = 1; //putis user in waiting state
        await user.save();
        console.log("user".magenta, id, "removed form waiting state".magenta);}
}

const finishGame = async (game_:any, winnerId: string) => {
    const game = await Game.findById(game_.id);
    if (!game) throw 'Game not found';

    game.live=false;
    game.win=winnerId;

    //save game
    game.row1=game_.row1;
    game.row2=game_.row2;
    game.row3=game_.row3;
    game.row4=game_.row4;
    game.row5=game_.row5;
    game.row6=game_.row6;

    game.save();

    //change players states
    const winner = await User.findById(winnerId);
    winner.state = 1; //puts user in game state
    winner.wins += 1
    await winner.save();

    var loserId
    if(winnerId === game.Player1){
        loserId = game.Player2
    }  
    else {
        loserId = game.Player1
    }

    const loser = await User.findById(loserId);
    loser.state = 1; //puts user in game state
    loser.losses += 1
    await loser.save();
}

const quitGame = async (game_:any, quitterId: string) => {
    const game = await Game.findById(game_.id);
    if (!game) throw 'Game not found';

    game.live=false;
    //game.win=winnerId;

    //save game
    game.row1=game_.row1;
    game.row2=game_.row2;
    game.row3=game_.row3;
    game.row4=game_.row4;
    game.row5=game_.row5;
    game.row6=game_.row6;

    var winnerId;
    if(quitterId === game.Player1){
        winnerId = game.Player2
    }
    else{
        winnerId = game.Player1
    }

    const winner = await User.findById(winnerId);
    winner.state = 1; //puts user in game state
    winner.wins += 1
    await winner.save();

    game.win=winnerId;
    game.save();
    
    const loser = await User.findById(quitterId);
    loser.state = 1; //puts user in game state
    loser.losses += 1
    await loser.save();
}

const customGame = async (data: any) => {
    const game = await checkIfAvailable(data) //returns true if both players are available
    if (game)
        return await createCustomGame(data);
    else
        return null;
}

const checkIfAvailable = async (data: any) => {
    //sees if there are any game live with either one of the players
    var query = { $or: [{ Player1: { $regex: data.player1, $options: 'i' } }, { Player2: { $regex: data.player2, $options: 'i' } }],  $and: [{ live: true }]}
    var game = await db.Game.findOne(query);
    if (game === null) {
        var player1 = await db.User.findById(data.player1);
        var player2 = await db.User.findById(data.player2);
        if (player1.state === 1 && player2.state===1)
            return true //both players are not currently in a game and both players are both online 
    }
    return false
    
}

const createCustomGame = async (data: any) => {
    if(checkIfAvailable(data)){
        var player1 = await db.User.findById(data.player1);
        var player2 = await db.User.findById(data.player2);

        const gameParams={
            // PLAYER ID
            Player1: data.player1,
            levelPlayer1: player1.level, //mudar depois para o nivel verdadeiro
            Player2: data.player2,
            levelPlayer2: player2.level,

            // game
            row1:["o","o","o","o","o","o","o"],
            row2:["o","o","o","o","o","o","o"],
            row3:["o","o","o","o","o","o","o"],
            row4:["o","o","o","o","o","o","o"],
            row5:["o","o","o","o","o","o","o"],
            row6:["o","o","o","o","o","o","o"],

            turn:data.player1,
            full:true
        }
        const game = new Game(gameParams)
        await game.save()

        //remove requests
        removeRequests(data);
        return game
    }
    return null
}

const removeRequests = async (data: any) => {
    var player1 = await db.User.findById(data.player1);
    var player2 = await db.User.findById(data.player2);

    var index_player1: number = player1.friendsGameRequests.indexOf(data.player2);
    if ( index_player1 > -1) {
        player1.friendsGameRequests.splice(index_player1, 1);
    }
    
    var index_player2: number = player2.friendsGameRequests.indexOf(data.player1);
    if (index_player2 != undefined && index_player2 > -1) {
        player2.friendsGameRequests.splice(index_player2, 1);
    } 
    
    await player1.save()
    await player2.save()
}

const playersInfo = async (data: any, serverUrl: string) => {
    var player1 = await db.User.findById(data.Player1);
    var player2 = await db.User.findById(data.Player2);

    player1.avatar = serverUrl +  '/uploads/' + player1.avatar;
    player2.avatar = serverUrl +  '/uploads/' + player2.avatar;

    const info=[]
    
    info.push(player1)
    info.push(player2)
    
    return info;
}

const getLiveGames = async () => {
    var games_=[]
    var query = {live:true}
    var games = await db.Game.find(query);
    for(let i=0; i<games.length; i++){
        var player1 = await db.User.findById(games[i].Player1);
        var player2 = await db.User.findById(games[i].Player2);

        games_.push({
            usernamePlayer1:player1.username, 
            usernamePlayer2:player2.username, 
            roomName:"stream"+games[i]._id
        })
    }

    return games_
} 

const getStreamGame = async (room: string) => {
    var id = room.split('stream');
    console.log(id)
    var game = await db.Game.findById(id[1]);

    if(game.live === true){
        var player1 = await db.User.findById(game.Player1);
        var player2 = await db.User.findById(game.Player2);

        const game_ = {
            usernamePlayer1: player1.username,
            usernamePlayer2: player2.username,
            roomName: room,

            // game
            row1:game.row1,
            row2:game.row2,
            row3:game.row3,
            row4:game.row4,
            row5:game.row5,
            row6:game.row6,

            turn:String
        }

        if(game.turn === game.Player1)
            game_.turn=player1.username
        else{game_.turn=player2.username}
        
        return game_
    }
    return null
    
}

const getStreamUpdate = async (game: any) => {
    var player1 = await db.User.findById(game.Player1);
    var player2 = await db.User.findById(game.Player2);

    const game_ = {
        usernamePlayer1: player1.username,
        usernamePlayer2: player2.username,
        roomName: 'stream' + game.id,

        // game
        row1: game.row1,
        row2: game.row2,
        row3: game.row3,
        row4: game.row4,
        row5: game.row5,
        row6: game.row6,

        turn: String
    }

    if (game.turn === game.Player1)
        game_.turn = player1.username
    else { game_.turn = player2.username }

    return game_
}

export default {
    putPlayerInWaiting,
    pullPlayerFromWaiting,
    finishGame,
    playPiece,
    quitGame,
    customGame,
    playersInfo,
    getLiveGames,
    getStreamGame
};