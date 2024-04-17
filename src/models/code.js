const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const codeSchema = new Schema({
    hashedContent: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["login", "change-password", "create-store"]
    },
    
    date: {
        type: Date,
        required: true
    }
});
module.exports = mongoose.model("Code", codeSchema);