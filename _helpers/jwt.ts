import expressJwt from 'express-jwt';

import { variables } from '../_helpers/read_env';

import userService from '../routes/users/user.service'

module.exports = jwt;

function jwt() {
    const secret = variables.JWT_SECRET;
    if(variables.JWT_SECRET === ""){
        console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
        process.exit(-1);
    }

    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/users/authenticate',
            '/users/register'
        ]
    });
}

async function isRevoked(req:any, payload:any, done:any) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};