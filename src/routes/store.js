const router = require("express").Router();
const {body} = require("express-validator");

const storeController = require("../controllers/store");
const auth = require("../middleware/auth");
const Store = require("../models/store");

router.post("/create", auth,  [
    body("name")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME")
    .custom( async (value, req) => {
        const store = await Store.findOne({name: value});
        if(store){
            return Promise.reject("NAME HAS USED");
        }
    }),

    body('address')
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE ADDRESS"),

    body("email")
    .isEmail()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE EMAIL")
    .normalizeEmail()
    .withMessage("INVLAID EMAIL"),

    body("phonenumber")
    .trim()
    .isMobilePhone()
    .withMessage("INVALID PHONENUMBER")
], storeController.createStore);

router.post("/create/check", auth, [
    body("name")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME")
    .custom( async (value, req) => {
        const store = await Store.findOne({name: value});
        if(store){
            return Promise.reject("NAME HAS USED");
        }
    }),

    body('address')
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE ADDRESS"),

    body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("PLEASE ENTER YOUR STORE EMAIL"),

    body("phonenumber")
    .trim()
    .isMobilePhone()
    .withMessage("INVALID PHONENUMBER"),

    body("code")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR CODE")
    .isString()
    .isLength(6)
    .withMessage("INVALID CODE")
], storeController.checkCodeStore);

router.get("/", auth, storeController.getStore);

router.patch("/update/info", auth, [
    body("name")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME"),

    body('address')
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE ADDRESS"),

    body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("PLEASE ENTER YOUR STORE EMAIL"),

    body("phonenumber")
    .trim()
    .isMobilePhone()
    .withMessage("INVALID PHONENUMBER")
], storeController.updateStore);

router.patch("/update/avatar", auth)

router.delete("/delete", auth, storeController.deleteStore);

router.post("/product/create", auth, [
    body("name")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME"),

    body("description")
    .trim()
    .isLength({min: 10})
    .withMessage("DESCRIPTION SHOULD HAVE AT LEAST 10 CHARACTERS"),

    body("price")
    .isFloat({min: 0.01})
    .withMessage("Invalid price"),

    body("category")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER PRODUCT CATEGORY"),

    body("quantity")
    .isNumeric()
    .withMessage("MUST BE NUMBER")
    .custom(value => value > 0)
    .withMessage("MUST BE GREATER THAN 0")
], storeController.createProduct);

router.get("/products/", auth, storeController.getProducts);

router.get("/product/:productId", auth, storeController.getProduct);

router.patch("/product/update/:productId", auth, [
    body("name")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER YOUR STORE NAME"),

    body("description")
    .trim()
    .isLength({min: 10})
    .withMessage("DESCRIPTION SHOULD HAVE AT LEAST 10 CHARACTERS"),

    body("price")
    .isFloat({min: 0.01})
    .withMessage("Invalid price"),

    body("category")
    .trim()
    .not().isEmpty()
    .withMessage("PLEASE ENTER PRODUCT CATEGORY"),

    body("quantity")
    .isNumeric()
    .withMessage("MUST BE NUMBER")
    .custom(value => value > 0)
    .withMessage("MUST BE GREATER THAN 0")
], storeController.updateProduct);

router.delete("/product/delete/:productId", auth, storeController.deleteProduct);

module.exports = router;
