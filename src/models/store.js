const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const storeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "/src/public/images/avatar.jpeg"
    },
    products: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                }
    ]
});

module.exports = mongoose.model('Store', storeSchema);