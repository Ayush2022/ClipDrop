const mongoose = require("mongoose");

const SnippetSchema = new mongoose.Schema({

    code: String,
    text: String,

    password: String, // only for files

    isFile: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Snippet", SnippetSchema);