import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema({
    members: { type: Array },
},
{
  timestamps: true
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

module.exports = mongoose.model('Conversation', schema);