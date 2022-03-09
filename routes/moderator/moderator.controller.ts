import express from 'express';
const router = express.Router();
import authorize from '../../_middleware/authorize'

import Role from '../../_helpers/role';

import moderator from './moderator.service';


// routes
router.put('/:id', authorize([Role.Moderator]), update);
router.get('/:id/search-user/:username', authorize([Role.Moderator]), searchUser);
router.get('/', authorize([Role.Moderator]), getAll);
router.get('/wall-of-fame',authorize([Role.Moderator]),  getWallOfFame);
router.get('/:id', authorize([Role.Moderator]), getById);
router.delete('/:id', authorize([Role.Moderator]), _delete);

module.exports = router;

function update(req: express.Request, res: express.Response, next: express.NextFunction) {
    moderator.updateTemporary(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function searchUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

    moderator.searchUser(req.params.id,req.params.username,fullUrl)
    .then(searchUsers => {
        console.log(searchUsers)
        searchUsers ? res.json(searchUsers) : res.sendStatus(404)
    })
    .catch(next);
}

function getAll(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    moderator.getAll(fullUrl)
        .then(users => {
            users ? res.json(users) : res.sendStatus(404)
        })
        .catch(next);
}

function getWallOfFame(req: express.Request, res: express.Response, next: express.NextFunction) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
    moderator.getWallOfFame(fullUrl)
        .then(users => {
            users ? res.json(users) : res.sendStatus(404)
        })
        .catch(next);
}

function getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    // regular users can get their own record and admins can get any record
    moderator.getById(req.params.id)
        .then(user => {
            
            var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';
            user.avatar = fullUrl+user.avatar;

            user ? res.json(user) : res.sendStatus(404)
        })
        .catch(next);
}

function _delete(req: express.Request, res: express.Response, next: express.NextFunction) {
    moderator.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

