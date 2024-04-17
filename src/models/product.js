const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const productSchema = new Schema({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Schema.Types.Number,
        required: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    },
    sold: {
        type: Schema.Types.Number,
        default: 0
    },
    imagesUrl: [
        {
            type: String,
            required: true
        }
    ],
    videoUrl: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Product', productSchema);