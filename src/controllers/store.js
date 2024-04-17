const Store = require("../models/store");
const User = require("../models/user");
const Product = require("../models/product");

const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcryptjs");

const deleteFile = require("../utils/deleteFile");
const sendMail = require("../utils/sendEmail");
const Code = require("../models/code");

exports.createStore = async function(req, res, next){
    //check error
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        //check exist store
        const existStore = await Store.findOne({userId: req.userId});
        if(existStore){
            console.log(existStore);
            const error = new Error("ACCOUNT ALREADY HAVE THE STORE");
            error.statusCode = 422;
            return next(error);
        }
        //create store
        const code = await sendMail(req.body.email, undefined, "create store");
        return res.status(200).json({message: "SEND EMAIL SUCCESSFULLY", token: code});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.checkCodeStore = async function(req, res, next){
        //check error
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            const error = new Error("VALIDATION FAILED");
            error.statusCode = 422;
            error.data = errors.array();
            return next(error);
        }
    
        try{
            const code = await Code.findOne({email: req.body.email, type: "create-store"});
            const isCorrectCode = await bcrypt.compare(req.body.code, code.hashedContent);
            if(!isCorrectCode){
                const error = new Error("INCORRECT CODE");
                error.statusCode = 422;
                error.data = errors.array();
                throw error;
            }
            await Code.deleteOne({email: req.body.email, type: "create-store"});
            const store = new Store({
                name: req.body.name,
                email: req.body.email,
                address: req.body.address,
                phonenumber: req.body.phonenumber,
                products: [],
                userId: req.userId
            });
            await store.save();
            const token = jwt.sign({
                email: req.body.email,
                userId: req.userId,
                storeId: store._id.toString()
            }, "touyenlanguoiyeucuatoi", {expiresIn: "1h"});
            return res.status(201).json({message: "CREATE STORE SUCCESSFULLY", store: store, token: token});
        }
        catch(error){
            if(!error.statusCode)
                error.statusCode = 500;
            return next(error);
        }
}

exports.getStore = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        return next(error);
    }
    //get
    try{
        const store = await Store.findById(req.storeId);
        if(!store){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        return res.status(200).json({message: "GETTING STORE SUCCESSFULLY", store: store});
        }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }   
};

exports.updateStore = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    //update store
    try{
        const store = await Store.findById(req.storeId);
        if(!store){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        store.name = req.body.name;
        store.address = req.body.address;
        store.email = req.body.email;
        store.phonenumber = req.body.phonenumber;
        await store.save();
        return res.status(200).json({message: "UPDATED STORE SUCCESSFULLY", store: store});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }   
}

exports.updateAvatar = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.file.images){
        const error = new Error("NO IMAGES FOUND");
        error.statusCode = 422;
        return next(error);
    }
    try{
        const store = await Store.findById(req.storeId);
        if(store.avatar && store.avatar !== "/images/avatar.jpeg"){
            deleteFile(store.avatar);
        }
        store.avatar = req.file.images[0].path;
        await store.save();
        return res.status(200).json({message: "SET AVATAR SUCCESSFULLY", store: store});
    }
    catch(error){
        error.statusCode = 500;
        return next(error);
    }
}

exports.deleteStore = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    //delete
    try{
        const store = await Store.findById(req.storeId);
        if(!store){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        await Store.deleteOne({_id: req.storeId});
        await Product.deleteMany({storeId: req.storeId});
        const token = jwt.sign({
            email: req.body.email,
            userId: req.userId
        }, "touyenlanguoiyeucuatoi", {expiresIn: "1h"});
        return res.status(200).json({message: "DELETED STORE SUCCESSFULLY", token: token})
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }

}

exports.createProduct = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    
    //create product
    try{
        const imagePaths = req.files.images.map(image => image.path);
        const product = new Product({
            storeId: req.storeId,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            quantity: req.body.quantity,
            imagesUrl: imagePaths
        })
        if(req.files.video)
        {
            product.videoUrl = req.files.video[0].path
        }
        await product.save();
        
        //update store
        const store = await Store.findById(req.storeId);
        if(!store){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        await store.products.push(product);
        await store.save();
        return res.status(201).json({message: "CREATED PRODUCT SUCCESSFULLY", product: product, store: store});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getProducts = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const productPerPage = 4;
        const currentPage = req.query.page || 1;

        const store = await Store.findById(req.storeId).populate("products");
        if(!store){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        const products = store.products.slice((currentPage-1)*productPerPage, currentPage*productPerPage);
        
        res.status(200).json({message: "GETTING PRODUCTS SUCCESSFULLY", products: products});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getProduct = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const product = await Product.findById(req.params.productId);
        if(!product){
            const error = new Error("PRODUCT DOESN'T EXIST");
            error.statusCode = 500;
            throw error;
        }
        if(product.storeId.toString() !== req.storeId)
        {
            const error = new Error("DON'T PERMITTED");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            message: "GETTING PRODUCT SUCCESSFULLY", product: product});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.updateProduct = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error("VALIDATION FAILED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    //update product
    try{
        const product = await Product.findById(req.params.productId);
        if(!product){
            const error = new Error("PRODUCT DOESN'T EXIST");
            error.statusCode = 500;
            throw error;
        }
        if(product.storeId.toString() !== req.storeId)
        {
            const error = new Error("DON'T PERMITTED");
            error.statusCode = 500;
            throw error;
        }
        product.name = req.body.name;
        product.description = req.body.description;
        product.category = req.body.category;
        product.quantity = req.body.quantity;
        product.price = req.body.price;
        if(req.files.images){
            product.imagesUrl.forEach(image => deleteFile(image));
            const imagePaths = req.files.images.map(image => image.path);
            product.imagesUrl = imagePaths;
        }
        if(req.files.video){
            if(product.videoUrl)
                deleteFile(product.videoUrl);
            product.videoUrl = req.files.video[0].path;
        }
        await product.save();
        return res.status(200).json({message: "UPDATED PRODUCT SUCCESSFULLY", product: product});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.deleteProduct = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(!req.storeId){
        const error = new Error("STORE ISN'T CREATED");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const product = await Product.findById(req.params.productId);
        if(!product){
            const error = new Error("PRODUCT DOESN'T EXIST");
            error.statusCode = 500;
            throw error;
        }
        if(product.storeId.toString() !== req.storeId)
        {
            const error = new Error("DON'T PERMITTED");
            error.statusCode = 500;
            throw error;
        }
        product.imagesUrl.forEach(imageUrl => deleteFile(imageUrl));
        if(product.videoUrl){
            deleteFile(product.videoUrl)
        }
        await Product.findByIdAndDelete(req.params.productId);
        return res.status(200).json({message: "DELETED SUCCESSFULLY"});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};
