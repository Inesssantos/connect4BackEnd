import express = require('express');
const router = express.Router();

import authorize from '../../_middleware/authorize'

import Role from '../../_helpers/role';

import gameService from './game.service';

// routes
router.post('/waitingRoom', authorize([Role.Player]), waitingRoom);
router.post('/removeFromWaiting', authorize([Role.Player]), removeFromWaiting);
router.post('/endGame',authorize([Role.Player]), endGame);
router.get('/get-live-games', authorize([Role.Player]), getLiveGames);

module.exports = router;

function waitingRoom(req: express.Request, res: express.Response, next: express.NextFunction) {
    gameService.putPlayerInWaiting(req.body.userId)
    .then(() => res.json({}))
    .catch((err:any) => next(err));
}

function removeFromWaiting(req: express.Request, res: express.Response, next: express.NextFunction) {
    gameService.pullPlayerFromWaiting(req.body.userId)
    .then(() => res.json({}))
    .catch((err:any) => next(err));
}

function endGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    gameService.finishGame(req.body.userId, req.body.friendId)
    .then(() => res.json({}))
    .catch((err:any) => next(err));
}

function getLiveGames(req: express.Request, res: express.Response, next: express.NextFunction) {
    gameService.getLiveGames()
    .then((gameList:any) => {
        gameList ? res.json(gameList) : res.json()
    })
    .catch(next);
}