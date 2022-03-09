import { variables } from './read_env';

if(variables.MONGO_URL === ""){
    console.log("Unable to load \".env\" file. Please provide one to store the MONGO_URL with mongodb url to connect");
    process.exit(-1);
}

import mongoose = require ('mongoose');
var connectionOptions: mongoose.ConnectOptions = {};
mongoose.connect(variables.MONGO_URL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.Promise = global.Promise;

export default {
    User: require('../routes/users/user.model'),
    RefreshToken: require('../routes/users/refresh-token.model'),
    Message: require('../routes/chat/message.model'),
    Game: require('../routes/game/game.model'),
    Conversation: require('../routes/chat/conversation.model'),
    isValidId
};

function isValidId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}