import express from 'express';
const router = express.Router();

import authorize from '../../_middleware/authorize';
import Role from '../../_helpers/role';

import friendService from './friends.service';

// routes
router.get('/:id/get-list-users', authorize([Role.Player]), getListUsers);
router.get('/:id/search-user/:username', authorize([Role.Player]), searchUser);

router.post('/send-request-friend', authorize([Role.Player]), sendRequestFriend);
router.post('/cancel-request-friend', authorize([Role.Player]), cancelRequestFriend);
router.post('/get-request-friend-send', authorize([Role.Player]), getRequestsFriendsSend);
router.post('/get-request-friend-received', authorize([Role.Player]), getRequestsFriendsReceived);

router.post('/accept-friend', authorize([Role.Player]), acceptFriend);
router.post('/deny-friend', authorize([Role.Player]), denyFriend);
router.post('/remove-friend', authorize([Role.Player]), removeFriend);

router.get('/:id/get-friends', authorize([Role.Player]), getFriends);
router.get('/:id/get-friends-online', authorize([Role.Player]), getFriendsOnline);

router.get('/:id/get-game-requests', authorize([Role.Player]), getListGameRequests);
router.post('/send-request-game', authorize([Role.Player]), sendRequestGame);
router.post('/deny-game-request', authorize([Role.Player]), denyGameRequest);
router.post('/get-info-game', authorize([Role.Player]), getInfoForGame);

module.exports = router;

function getListUsers(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

    friendService.getListUsers(req.params.id,fullUrl)
    .then(listUsers => {
        listUsers ? res.json(listUsers) : res.sendStatus(404)
    })
    .catch(next);
}

function searchUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

    friendService.searchUser(req.params.id,req.params.username,fullUrl)
    .then(searchUsers => {
        searchUsers ? res.json(searchUsers) : res.sendStatus(404)
    })
    .catch(next);
}

function sendRequestFriend(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.sendRequestFriend(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function cancelRequestFriend(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.cancelRequestFriend(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function getRequestsFriendsSend(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    friendService.getRequestsFriendsSend(req.body.userId,fullUrl)
    .then(friendsRequestsSend => {
        friendsRequestsSend ? res.json(friendsRequestsSend) : res.json()
    })
    .catch(next);
}

function getRequestsFriendsReceived(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    friendService.getRequestsFriendsReceived(req.body.userId,fullUrl)
    .then(friendsRequestsReceived => {
        friendsRequestsReceived ? res.json(friendsRequestsReceived) : res.json()
    })
    .catch(next);
}

function acceptFriend(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.answerRequestFriend(req.body.userId, req.body.friendId, 1)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function denyFriend(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.answerRequestFriend(req.body.userId, req.body.friendId, 0)
    .then(() => res.json({}))
    .catch(err => next(err));
}


function removeFriend(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.removeFriend(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function getFriends(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    friendService.getListFriends(req.params.id,fullUrl)
    .then(friendsList => {
        friendsList ? res.json(friendsList) : res.json()
    })
    .catch(next);
}

function getFriendsOnline(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    friendService.getListFriendsOnline(req.params.id,fullUrl)
    .then(friendsList => {
        friendsList ? res.json(friendsList) : res.json()
    })
    .catch(next);
}

function getListGameRequests(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    friendService.getListGameRequests(req.params.id,fullUrl)
    .then(gameList => {
        gameList ? res.json(gameList) : res.json()
    })
    .catch(next);
}
function sendRequestGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.sendRequestForGame(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function denyGameRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.answerRequestGame(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function getInfoForGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    friendService.getInfoForGame(req.body.player1, req.body.player2)
    .then(gameList => {
        gameList ? res.json(gameList) : res.json()
    })
    .catch(next);
}