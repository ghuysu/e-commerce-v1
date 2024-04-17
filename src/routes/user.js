const router = require("express").Router();
const {body} = require("express-validator");

const User = require("../models/user");
const userController = require("../controllers/user");
const auth = require("../middleware/auth");

router.get("/user", auth, userController.getUser);

router.patch("/update/info", auth, [
    body("username")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME"),

    body('address')
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE ADDRESS"),

    body("phonenumber")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR PHONENUMBER")
    .isMobilePhone()
    .withMessage("INVALID PHONENUMBER")
], userController.updateInfo);

router.patch("/update/avatar", auth, userController.updateAvatar);

router.get("/", auth, userController.getProducts);

router.get("/product/:productId", auth, userController.getProduct);

router.post("/cart/add/:productId", auth, [
    body("quantity")
    .isNumeric()
    .withMessage("MUST BE NUMBER")
    .custom(value => value > 0)
    .withMessage("MUST BE GREATER THAN 0")
], userController.addToCart);

router.get("/cart", auth, userController.getCart);

router.delete("/cart/delete/:productId", auth, userController.deleteCartProduct);

router.post("/order", auth, [
    body("paymentType")
    .custom(value => ["cash", "visa", "other"].includes(value))
    .withMessage("INVALID PAYMENT TYPE")
], userController.order);

router.get("/order/:orderId", auth, userController.getOrder);

router.get("/orders", auth, userController.getOrders);

router.post("/create_payment_url", [
    body("price")
    .isFloat({min: 0.01})
    .withMessage("INVALID PRICE")
], userController.createPaymentUrl);

router.get("/vnpay_ipn", );

router.get("/vnpay_return");

module.exports = router;