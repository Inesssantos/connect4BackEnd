import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    // PERSONAL DATA
    avatar: { type: String, default: 'default-avatar.jpg'},
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
      
    // GAME DATA
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // FRIENDS DATA
    friendsRequestsReceived: [String],
    friendsRequestsSend: [String],
    friendsList: [String],
    friendsGameRequests: [String],
    
    // SYSTEM DATA
    role: { type: String, required: true },
    temporary: { type: Boolean, default: false },
    state:{ type: Number, default: 0 }, // 0 -> Offline | 1 -> Online | 2 -> wait state | 3 -> gamming

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

module.exports = mongoose.model('User', schema);