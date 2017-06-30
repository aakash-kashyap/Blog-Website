var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text: String,
    created:  {type: Date, default: Date.now },
    // author: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel"
        },
        username: String
    }
});
module.exports = mongoose.model("Comment", commentSchema);