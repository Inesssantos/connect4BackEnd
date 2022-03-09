import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema({
    conversationId: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
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

module.exports = mongoose.model('Message', schema);