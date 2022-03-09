import express from 'express';
import jwt from 'express-jwt';

import db from '../_helpers/db';
import { variables } from '../_helpers/read_env';


export default function authorize(roles: Array<String>) {
    // roles param can be a single role string (e.g. Role.Player or 'Player') 
    // or an array of roles (e.g. [Role.Moderator, Role.Player] or ['Moderator', 'Player'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    var secret = variables.JWT_SECRET;
    if(variables.JWT_SECRET === ""){
        console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
        process.exit(-1);
    }
    
    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        // authorize based on user role
        async (req: any, res: express.Response, next: express.NextFunction) => {

            const user = await db.User.findById(req.user.id);

            if (!user || (roles.length && !roles.includes(user.role))) {
                // user no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }


            // authentication and authorization successful
            req.user.role = user.role;
            const refreshTokens = await db.RefreshToken.find({ user: user.id });
            req.user.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token);
            next();
        }
    ];
}