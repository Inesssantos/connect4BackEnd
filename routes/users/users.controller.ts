import express = require('express');
const router = express.Router();

import fileUpload = require('../../_helpers/storage');
import Role from '../../_helpers/role';

import authorize = require('../../_middleware/authorize')

import userService from './user.service';

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', revokeToken);
router.get('/:id/refresh-tokens', getRefreshTokens);
router.get('/:id/get-token', getTokenExist);

router.get('/wall-of-fame', getWallOfFame);

router.get('/:id', getById);
router.put('/:id', update);
router.post('/:id/update-avatar',  fileUpload.fileUpload  , updateAvatar);

module.exports = router;

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;
    const ipAddress = req.ip;

    userService.authenticate(username, password, ipAddress)
        .then(({ refreshToken, ...user }) => {

            var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
            user.avatar = fullUrl+user.avatar;

            res.json({user,refreshToken});
        })
        .catch(next);
}

function register(req: express.Request, res: express.Response, next: express.NextFunction) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch((err: any) => next(err));
}

function refreshToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { refreshToken } = req.body;

    userService.refreshToken(refreshToken)
        .then(({ refreshToken, ...user }:any) => {
            
            var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
            user.avatar = fullUrl+user.avatar;

            res.json({user,refreshToken});
        })
        .catch(next);
}

function revokeToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    // accept token from request body or cookie
    const token = req.body.token

    if (!token) return res.status(400).json({ message: 'Token is required' });

    userService.revokeToken(token)
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function getRefreshTokens(req: express.Request, res: express.Response, next: express.NextFunction) {
    userService.getRefreshTokens(req.params.id)
        .then((tokens: any) => tokens ? res.json(tokens) : res.sendStatus(404))
        .catch(next);
}


function getTokenExist(req: express.Request, res: express.Response, next: express.NextFunction) {
    userService.getTokenExist(req.params.id)
    .then((tokens: any) => tokens ? res.json(tokens) : res.sendStatus(404))
    .catch(next);
}

function getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    userService.getById(req.params.id)
        .then((user: { avatar: string; }) => {
            
            var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
            user.avatar = fullUrl+user.avatar;

            user ? res.json(user) : res.sendStatus(404)
        })
        .catch(next);
}

function getWallOfFame(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    userService.getWallOfFame(fullUrl)
        .then((users: any) => {
            users ? res.json(users) : res.sendStatus(404)
        })
        .catch(next);
}


function update(req: express.Request, res: express.Response, next: express.NextFunction) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch((err: any) => next(err));
}

function updateAvatar(req: any, res: express.Response, next: express.NextFunction) {
    userService.updateAvatar(req.params.id, req.file.filename)
    .then(() => res.json({}))
    .catch((err: any) => next(err));
}

