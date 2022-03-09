
import jwt = require('jsonwebtoken');
import bcrypt = require('bcryptjs');
import crypto = require("crypto");
import fs = require('fs')

import db from '../../_helpers/db';

import Role from '../../_helpers/role';
import { variables } from '../../_helpers/read_env';

const User = db.User;
const RefreshToken = db.RefreshToken;

const authenticate = async (username: string, password: string, ipAddress: string) => {

    const user = await User.findOne({username});

    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw 'Username or password is incorrect';
    }

    user.state = 1;
    await user.save();

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

const create = async (userParam: any) => {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    if (await User.findOne({ email: userParam.email })) {
        throw 'Email "' + userParam.email + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

const refreshToken = async (token: string) => {
    const refreshToken = await getRefreshToken(token);

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(refreshToken.user);
    await newRefreshToken.save();

    await RefreshToken.findByIdAndRemove(refreshToken.id)
    
    // generate new jwt
    const jwtToken = generateJwtToken(refreshToken.user);

    const user = await getUser(refreshToken.user)

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

const revokeToken = async (token: string) => {  
    const refreshToken = await getRefreshToken(token);
    const user = await getUser(refreshToken.user)
    user.state = 0;
    await user.save();

    await RefreshToken.findByIdAndRemove(refreshToken.id)
}

const getTokenExist = async (userId: string) => {
    // check that user exists
    await getUser(userId);

    const refreshTokens = await RefreshToken.find({ user: userId });
    return refreshTokens;
}

const getRefreshTokens = async (userId: string) => {
    // check that user exists
    await getUser(userId);

    // return refresh tokens for user
    const refreshTokens = await RefreshToken.find({ user: userId });
    return refreshTokens;
}

const getById = async (id:string) => {
    const user = await getUser(id);
    return basicDetails(user);
}

const getWallOfFame = async (fullUrl: string) => {
    const users = await User.find({role : Role.Player}).sort( { wins: -1 } ).limit(10);
    return users.map((x:any) => {
        x.avatar = fullUrl + x.avatar
        return basicDetails(x);
    });
}

const update = async (id: string, userParam: any) => {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    if(!bcrypt.compareSync(userParam.oldpassword, user.password)) {
        throw 'The old password is wrong ';
    }
    else{
        userParam.password = bcrypt.hashSync(userParam.newpassword, 10)
    }

    console.log(userParam)
    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

const updateAvatar = async (id: string, imageName: string) => {

    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';

    if(user.avatar != "default-avatar.jpg"){
        var path: string = "uploads" + "\\" + user.avatar;

        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return
            }
    
            //file removed
        })
    }


    user.avatar = imageName;

    await user.save();
}

const getUser = async (id: string) => {
    if (!db.isValidId(id)) throw 'User not found';
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

////////////////////////////////

const getRefreshToken = async (token:string) => {
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(userId: string){
    if(variables.JWT_SECRET === ""){
        console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
        process.exit(-1);
    }
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ sub: userId, id: userId }, variables.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(id: string){
    // create a refresh token that expires in 7 days
    return new RefreshToken({
        user: id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user: any) {
    const { avatar, id, username, email, password, firstname, lastname, role, wins, losses, temporary, level, xp } = user;
    return { avatar, id, username, email, password, firstname, lastname, role, wins, losses, temporary, level, xp };
}

export default{
    authenticate,
    create,

    refreshToken,
    revokeToken,
    getTokenExist,
    getRefreshTokens,

    getById,
    getWallOfFame,

    update,
    updateAvatar,
};