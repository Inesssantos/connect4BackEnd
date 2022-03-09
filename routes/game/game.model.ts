import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    // PLAYERS IDs
    Player1: { type: String},
    levelPlayer1: {type: Number},

    Player2: { type: String},
    levelPlayer2: {type: Number},
      
    // GAME DATA
    win: { type: String},

    // game
    row1:[{type : String}],
    row2:[{type : String}],
    row3:[{type : String}],
    row4:[{type : String}],
    row5:[{type : String}],
    row6:[{type : String}],

    live:{type:Boolean, default:true},
    full:{type:Boolean, default:false},
    turn:{type: String},

    lastPlay: {type: Number},

    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('Game', schema);