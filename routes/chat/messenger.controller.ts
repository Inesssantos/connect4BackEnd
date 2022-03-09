import express from 'express';
const router = express.Router();

import authorize from '../../_middleware/authorize';
import Role from '../../_helpers/role';

import messengerService from './messenger.service';

// routes
router.post('/create-conversation', authorize([Role.Player]), createConversation);
router.get("/get-all-conversations/:userId", authorize([Role.Player]), getAllConversations)
router.get("/get-conversation/:userId/:friendId", authorize([Role.Player]), getConversation)
router.delete('/delete-conversation/:id', authorize([Role.Player]), deleteConversation);

router.get("/get-messages/:id", authorize([Role.Player]), getMessages)
router.post('/add-message', authorize([Role.Player]), addMessage);
router.delete('/delete-messages/:id', authorize([Role.Player]), deleteMessage);

module.exports = router;

function createConversation(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.createConversation(req.body.senderId,  req.body.receiverId)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAllConversations(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.getAllConversations(req.params.userId)
    .then(conversation => conversation ? res.json(conversation) : res.sendStatus(404))
    .catch(next);
}

function getConversation(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.getConversation(req.params.userId,req.params.friendId)
    .then(conversation => conversation ? res.json(conversation) : res.sendStatus(404))
    .catch(next);
}

function getMessages(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.getMessages(req.params.id)
    .then(messages => messages ? res.json(messages) : res.sendStatus(404))
    .catch(next);
}

function deleteConversation(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.deleteConversation(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function addMessage(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.addMessage(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteMessage(req: express.Request, res: express.Response, next: express.NextFunction) {
    messengerService.deleteMessages(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}





