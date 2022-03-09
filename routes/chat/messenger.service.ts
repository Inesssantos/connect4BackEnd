import db from '../../_helpers/db';

const Message = db.Message;
const Conversation = db.Conversation;

const createConversation = async (senderId: string, receiverId: string) => {
    console.log(senderId, receiverId)
    const newConversation = new Conversation({
        members: [senderId, receiverId]
    });

    await newConversation.save()
}

const getAllConversations = async (userId: string) => {
    const conversation = await Conversation.find({
        members: { $in : [userId]}
    })

    return conversation;
}

const getConversation = async (userId: string, friendId: string) => {
    const conversation = await Conversation.findOne({
        $or: [{ members:  [userId, friendId] }, { members:  [friendId, userId] }]
    })

    return conversation;
}

const deleteConversation = async (id: string) => {
    await Message.deleteMany(Message.find({conversationId: id}))
    await Conversation.findByIdAndRemove(id)
}

const getMessages = async (id: string) => {
    const messages = await Message.find({
        conversationId: id
    })

    return messages;
}

const addMessage = async (userParam:any) => {
    const newMessage = new Message(userParam);

    await newMessage.save()
}

const deleteMessages = async (id: string) => {
    await Message.deleteMany(Message.find({conversationId: id})) 
}

export default {
    createConversation,
    getAllConversations,
    getConversation,
    deleteConversation,

    getMessages,
    addMessage,
    deleteMessages
};