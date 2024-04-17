const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const {validationResult} = require("express-validator");
const nodeMailer = require("nodemailer");
const vnpay = require("vnpay");
const deleteFile = require("../utils/deleteFile");

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'daogiahuysu@gmail.com',
        pass: 'finszjthxcxchzho',
    }
});

exports.getProducts = async function(req, res, next){
    try{
        const productPerPage = 4;
        const currentPage = req.query.page || 1;

        const products = await Product.find()
                            .skip((currentPage-1)*productPerPage)
                            .limit(productPerPage);
        if(!products){
            const error = new Error("NO PRODUCT FOUND");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({message: "GETTING PRODUCTS SUCCESSFULLY", products: products});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getProduct = async function(req, res, next){
    try{
        const product = await Product.findById(req.params.productId);
        if(!product){
            const error = new Error("PRODUCT DOESN'T EXIST");
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

exports.addToCart = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
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
    try{
        const product = await Product.findById(req.params.productId);
        if(!product){
            const error = new Error("PRODUCT DOESN'T EXIST");
            error.statusCode = 500;
            throw error;
        }
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        let isExisted = false;
        user.cart.forEach(product => {
            if(product.id.toString() === req.params.productId){
                product.quantity = +product.quantity +  +req.body.quantity;
                isExisted = true;
            }
        })
        if(isExisted === false)
            user.cart.push({id: req.params.productId, quantity: req.body.quantity});
        await user.save();
        res.status(200).json({
            message: "ADD TO CART SUCCESSFULLY", user: user});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getCart = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const user = await User.findById(req.userId).populate({
            path: "cart",
            populate: {
                path: "id",
                model: "Product"
            }});
        if(!user){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        return res.status(200).json({
            message: "GETTING CART SUCCESSFULLY", cart: user.cart});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.deleteCartProduct = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("SOMETHING IS WRONG, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        user.cart = user.cart.filter(product => product.id.toString() !== req.params.productId);
        await user.save();
        return res.status(200).json({
            message: "DELETE PRODUCT IN CART SUCCESSFULLY", cart: user.cart});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.order = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
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
    try{
        const detailedProds = await Promise.all(req.body.products.map(async prod => {
            const product = await Product.findById(prod.id);
            return {
                name: product.name,
                price: product.price,
                quantity: prod.quantity
            }
        }));
        const products = req.body.products.map(product => {
            return {
                id: product.id,
                quantity: product.quantity}
        });
        let totalPrice = 0;
        const order = new Order({
            products: products,
            userId: req.userId,
            storeId: req.body.storeId,
            orderDate: new Date().toISOString(),
            paymentType: req.body.paymentType
        });
        for (const product of products) {
            const prod = await Product.findById(product.id);
            if (!prod) {
                const error = new Error("NO PRODUCT FOUND");
                error.statusCode = 500;
                return next(error);
            }
            totalPrice += prod.price * product.quantity;
            prod.quantity = +prod.quantity - +product.quantity;
            await prod.save();
        }
        order.totalPrice = totalPrice;
        await order.save();

        //send email
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("CAN'T SEND ORDER INFORMATION, PLEASE CONTRACT US VIA daogiahuysu@gmai.com FOR HELP");
            error.statusCode = 500;
            throw error;
        }
        await transporter.sendMail({
            from: 'daogiahuysu@gmail.com',
            to: req.email,
            subject: 'Order Confirmation',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
            
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
            
                    h1 {
                        color: #333;
                    }
            
                    p {
                        color: #666;
                    }
            
                    .order-details {
                        margin-top: 20px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
            
                    .thank-you {
                        text-align: center;
                        margin-top: 20px;
                        color: #28a745;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Confirmation</h1>
                    <p>Dear ${user.username},</p>
                    <p>Thank you for your order. We are pleased to confirm that your order has been received and is being processed. Below are the details of your order:</p>
            
                    <!-- Order Details -->
                    <div class="order-details">
                        <p><strong>Order ID:</strong> ${order._id.toString()}</p>
                        <p><strong>Order Date:</strong> ${order.orderDate}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentType}</p>
                        <p><strong>Total Price:</strong> $${order.totalPrice}</p>
                        <p><strong>Have To Pay When Receive:</strong>$${order.isPaid === true ? 0 : order.totalPrice}</p>
                    </div>

                    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Loop through products and display in the table -->
                            ${
                                detailedProds.map(product => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${product.price}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${product.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
            
                    <div class="thank-you">
                        <p>Thank you for choosing us!</p>
                    </div>
                </div>
            </body>
            </html>
            `
        })

        return res.status(201).json({message: "CREATED ORDER SUCCESSFULLY", order: order});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getOrders = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const orders = await Order.find({userId: req.userId})
                                    .populate({
                                        path: "products",
                                        populate: {
                                            path: "id",
                                            model: "Product"
                                        }
                                    });
        return res.status(200).json({
            message: "GETTING ORDERS SUCCESSFULLY", orders: orders});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.getOrder = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try{
        const order = await Order.findById(req.params.orderId)
                                 .populate({
                                    path: "products",
                                    populate: {
                                        path: "id",
                                        model: "Product"
                                    }
                                 });
        if(!order){
            const error = new Error("NO ORDER FOUND");
            error.statusCode = 500;
            throw error;
        }
        return res.status(200).json({
            message: "GETTING ORDER SUCCESSFULLY", orders: order});
    }
    catch(error){
        if(!error.statusCode)
            error.statusCode = 500;
        return next(error);
    }
};

exports.createPaymentUrl = async function(req, res, next) {
    try {
        const returnUrl = "http://localhost:8080/vppay-return";
        const orderId = req.params.orderId;
        const amount = req.body.price;

        const vnpay = new Vnpay({
        vnp_TmnCode: "a",
        vnp_HashSecret: "b",
        vnp_ReturnUrl: returnUrl
        });

        const paymentParams = {
        vnp_TxnRef: orderId,
        vnp_OrderInfo: "Thanh Toán Đơn Hàng #" + orderId,
        vnp_Amount: amount * 100,
        vnp_Command: "pay",
        vnp_CreateDate: new Date().toISOString(),
        vnp_ReturnUrl: returnUrl
        };

        const paymentUrl = await vnpay.createPaymentUrl(paymentParams);
        res.redirect(paymentUrl);
    } 
    catch (error) {
        error.statusCode = 500;
        next(error);
    }
}

exports.vnpayIPN = async function(req, res, next) {
    try {
        const query = req.query;
        const secureCode = query.vnp_SecureHash;
    
        const vnpay = new Vnpay({
            vnp_HashSecret: "YOUR_VNPAY_HASH_SECRET"
        });
    
        const isValidCallback = vnpay.verifyResponse(query);
    
        if (!isValidCallback) {
            return res.status(200).json({message: "FAIL PAY", responseCode: "97", query: query})
        }
        const order = await Order.findById(query.vnp_TxnRef);
        if (!order) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }
        order.isPaid = true;
        await order.save();
        return res.status(200).json({message: "PAID SUCCESSFULLY", responseCode: "00", query: query, order: order});
    } 
    catch (error) {
        error.statusCode = 500;
        next(error);
    }
};
  
exports.vnpayReturn = async function(req, res, next) {
    try {
        const query = req.query;
        const vnp_HashSecret = "YOUR_VNPAY_HASH_SECRET";
        const vnpay = new Vnpay({vnp_HashSecret});
        const isValidCallback = vnpay.verifyResponse(query);

        if (!isValidCallback) {
            return res.status(200).json({message: "FAIL PAY", responseCode: "97", query: query});
        }
        return res.status(200).json({message: "PAID SUCCESSFULLY", infor: query})
    } catch (err) {
        return next(err);
    }
};

exports.updateAvatar = async function(req, res, next){
    //check error
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    if(req.files){
        console.log(req.files)
        if(!req.files.images){
            const error = new Error("NO IMAGES FOUND");
            error.statusCode = 422;
            return next(error);
        }
    }
    try{
        const user = await User.findById(req.userId);
        if(user.avatar && user.avatar !== "src/public/images/avatar.jpeg"){
            deleteFile(user.avatar);
        }
        user.avatar = req.files.images[0].path;
        await user.save();
        return res.status(200).json({message: "SET AVATAR SUCCESSFULLY", user: user});
    }
    catch(error){
        error.statusCode = 500;
        return next(error);
    }
}

exports.updateInfo = async function(req, res, next){
    //check errors
    if(!req.userId){
        const error = new Error("PLEASE LOGIN");
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
    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("No users found");
            error.statusCode = 500;
            throw error;
        }
        user.username = req.body.username;
        user.phonenumber = req.body.phonenumber;
        user.address = req.body.address;
        await user.save();
        return res.status(200).json({message: "UPDATE INFO USER SUCCESSFULLY", user: user});
    }
    catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        return next(error);
    }
}

exports.getUser = async function(req, res, next){
    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("No users found");
            error.statusCode = 500;
            throw error;
        }
        return res.status(200).json({message: "GETTING USER SUCCESSFULLY", user: user});
    }
    catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        return next(error);
    }
}