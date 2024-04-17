const User = require("../models/user");
const Store = require("../models/store");
const Code = require("../models/code");

const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const brycpt = require("bcryptjs");
const sendMail = require("../utils/sendEmail");

exports.signup =  async function(req, res, next) {
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    //create new user
    try{
        const hashedPassword = await brycpt.hash(req.body.password, 12);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            username: req.body.username,
            phonenumber: req.body.phonenumber,
            address: req.body.address,
            cart: []
        });
        await user.save();
        console.log("USER " + user._id + " CREATED")
        return res.status(201).json({message: "USER CREATED", userId: user._id})
    }
    catch(error)
    {
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
}

exports.login = async function(req, res, next){
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    //check account
    try{
        const user = await User.findOne({email: req.body.email});
        if(!user){
            const error = new Error("EMAIL DOESN'T REGISTERED");
            error.statusCode = 401;
            throw error;
        }
        const isCorrectPassword = await brycpt.compare(req.body.password, user.password);
        if(!isCorrectPassword){
            const error = new Error("WRONG PASSWORD");
            error.statusCode = 401;
            throw error;
        }
        
        const code = sendMail(req.body.email, undefined, "login");
        return res.status(200).json({message: "SENT AUTHENTICATION CODE", code: code});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
}

exports.checkLogin = async function(req, res, next){
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const code = await Code.findOne({userEmail: req.body.email, type: "login"});
        if(!code){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        const isSame = await brycpt.compare(req.body.code, code.hashedContent);
        if(!isSame){
            const error = new Error("WRONG CODE");
            error.statusCode = 422;
            throw error;
        }
        await Code.deleteOne({userEmail: req.body.email, type: "login"});
        const user = await User.findOne({email: req.body.email});
        if(!user){
            const error = new Error("EMAIL DOESN'T REGISTERED");
            error.statusCode = 401;
            throw error;
        }
        const decodedToken = { 
            email: req.body.email,
            userId: user._id.toString()
        }
        const store = await Store.findOne({userId: user._id.toString()});
        if(store){
            decodedToken.storeId = store._id.toString()
        }
        const token = jwt.sign(decodedToken, "touyenlanguoiyeucuatoi", {expiresIn: "1h"});

        return res.status(200).json({
            message: "LOGIN SUCCESSFULLY",
            token: token,
            user: user
        })
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
}

exports.forgotPassword = async function(req, res, next) {
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    
    //send email
    try{
        const user = await User.findOne({email: req.body.email});
        if(!user){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        const code = Math.floor(100000 + Math.random() * 900000);
        const hashedCode = await brycpt.hash(code.toString(), 12);
        const dbCode = new Code({
            hashedContent: hashedCode,
            userEmail: req.body.email,
            type: "change-password",
            date: new Date()
        });
        await dbCode.save();
        await transporter.sendMail({
            from: 'daogiahuysu@gmail.com',
            to: req.body.email,
            subject: 'Change Password',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                    <h2>Authentication Code</h2>
                    <p style="font-size: 16px;">You are receiving this email because you requested to change your password for login.</p>
                    <p style="font-size: 24px; font-weight: bold; color: #ccc;">${code}</p>
                    <p style="font-size: 16px;">Enter this code to verify your identity and complete the change-password process.</p>
                </div>`
        });
        return res.status(200).json({userId: user._id.toString(), message: "SEND EMAIL SUCCESSFULLY" })
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
}

exports.changePassword = async function(req, res, next){
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    //change password
    try{
        const code = await Code.findOne({email: req.body.email, type: "change-password"});
        if(!code){
            const error = new Error("NO CODE FOUND");
            error.statusCode = 402;
            throw error;
        }
        const isCorrectCode = await brycpt.compare(req.body.code, code);
        if(!isCorrectCode){
            const error = new Error("WRONG CODE");
            error.statusCode = 402;
            throw error;
        }
        await Code.deleteOne({email: req.body.email, type: "change-password"});
        const hashedPassword = await brycpt.hash(req.body.password, 12);
        const user = await User.findById(req.body.email);
        if(!user){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            message: "CHANGE PASSWORD SUCCESSFULLY", 
            user: {
                ...user._doc,
                id: user._id.toString()
            }})
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
}