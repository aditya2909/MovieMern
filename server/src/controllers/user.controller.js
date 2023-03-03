import userModel from '../models/user.model.js';
import jsonwebtoken from 'jsonwebtoken';
import responeHandler from '../handlers/response.handler.js';

const signup = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        
        const checkUser = await userModel.findOne({ username });
        
        if(username) return responeHandler.badrequest(res, "username already used");

        const user = new userModel();

        user.displayName = displayName;
        user.username = username;
        user.setPassword(password);
        
        await user.save();

        const token = jsonwebtoken.sign(
            { data: user.id },
            process.env.TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        responeHandler.created(res, {
            token,
            ...user._doc,
            id: user.id
        });
    } catch {
        responeHandler.error(res);
    }
}

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await userModel.findOne({ username }).select("username password salt id displayName");
        
        if(!user) return responeHandler.badrequest(res, "User not exist");

        if(!user.validPassword(password)) return responeHandler.badrequest(res, "Wrong Password");

        const token = jsonwebtoken.sign(
            { data: user.id },
            process.env.TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        user.password = undefined;
        user.salt = undefined; 

        responeHandler.created(res, {
            token,
            ...user._doc,
            id: user.id
        });
    } catch {
        responeHandler.error(res);
    }
}

const updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        
        const user = await userModel.findById(req.user.id).select("password id salt");

        if(!user) return responeHandler.unauthorize(res);

        if(!user.validPassword(password)) return responeHandler.badrequest(res, "Wrong Password");

        user.setPassword(newPassword);

        await user.save();

        responeHandler.ok(res);
    } catch {
        responeHandler.error(res);
    }
}

const getInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) return responeHandler.notfound(res);

        responeHandler.ok(res);
    } catch {
        responeHandler.error(res);
    }
}

export default{
    signin,
    signup,
    getInfo,
    updatePassword
}