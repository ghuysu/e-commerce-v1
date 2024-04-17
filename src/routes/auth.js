const router = require("express").Router();
const {body} = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

router.post("/signup",[
    body("email")
    .isEmail()
    .withMessage("INVALID EMAIL")
    .normalizeEmail()
    .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
            return Promise.reject("EMAIL ALREADY EXISTED");
        }
    }),

    body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("PASSWORD MUST HAVE AT LEAST 6 CHARACTERS")
    .matches(/\d/)
    .withMessage("PASSWORD MUST HAVE AT LEAST 1 DIGIT")
    .matches(/[!@#$%^&*(),.?":{}|<>\-_]/)
    .withMessage("PASSWORD MUST HAVE AT LEAST 1 SPECIAL CHARACTERS"),
    
    body("username")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR USERNAME")
    .custom(async (value, { req }) => {
        const user = await User.findOne({ username: value });
        if (user) {
            return Promise.reject("USERNAME ALREADY EXISTED");
        }
    }),

    body("phonenumber")
    .trim()
    .isMobilePhone()
    .withMessage("INVALID PHONENUMBER"),

    body("address")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR ADDRESS")
], authController.signup);

router.post("/login", [
    body("email")
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR EMAIL")
    .isEmail()
    .withMessage("INVALID EMAIL")
    .normalizeEmail(),

    body("password")
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR PASSWORD")
],authController.login);

router.post("/check_login", [
    body("code")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR CODE")
    .isString()
    .isLength(6)
    .withMessage("INVALID CODE"),

    body("email")
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR EMAIL")
    .isEmail()
    .withMessage("INVALID EMAIL")
    .normalizeEmail()
    .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
            return Promise.reject("EMAIL DIDN'T EXIST");
        }
    })
], authController.checkLogin);

router.post("/forgot_password", [
    body("email")
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR EMAIL")
    .isEmail()
    .withMessage("INVALID EMAIL")
    .normalizeEmail()
    .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
            return Promise.reject("EMAIL ISN'T REGISTERED");
        }
    })
], authController.forgotPassword);

router.post("/change_password", [
    body("code")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR CODE")
    .isString()
    .isLength(6)
    .withMessage("INVALID CODE"),
    
    body("email")
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR EMAIL")
    .isEmail()
    .withMessage("INVALID EMAIL")
    .normalizeEmail()
    .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
            return Promise.reject("EMAIL DIDN'T EXIST");
        }
    }),
    
    body("password")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR PASSWORD")
    .isLength({ min: 6 })
    .withMessage("PASSWORD MUST HAVE AT LEAST 6 CHARACTERS")
    .matches(/\d/)
    .withMessage("PASSWORD MUST HAVE AT LEAST 1 DIGIT")
    .matches(/[!@#$%^&*(),.?":{}|<>\-_]/)
    .withMessage("PASSWORD MUST HAVE AT LEAST 1 SPECIAL CHARACTERS")
], authController.changePassword);

module.exports = router;