const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const orderSchema = new Schema({
    products: [
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
            },       
        }
    ],

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },

    orderDate: {
        type: Schema.Types.Date,
        required: true
    },

    paymentType: {
        type: String,
        enum: ["cash", "vnpay"],
        required: true
    },

    status: {
        type: String,
        enum: ["wait for being processed", "being delivered", "being received"],
        default: "wait for being processed"
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    totalPrice: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Order", orderSchema);