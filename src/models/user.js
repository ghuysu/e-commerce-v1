const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "/src/public/images/avatar.jpeg"
    },
    cart: [
                {
                    _id: false,
                    id: {
                        type: Schema.Types.ObjectId,
                        ref: 'Product',
                        required: true
                    },
                    quantity: {
                        type: Schema.Types.Number,
                        required: true
                    }
                }
    ]
});

module.exports = mongoose.model('User', userSchema);