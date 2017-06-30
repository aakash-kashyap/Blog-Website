var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
//    image: {type: String, default: "https://nonprofitorgs.files.wordpress.com/2010/07/blog.jpg" },
    body:  String,
    created:  {type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel"
        },
        username: String
    },
    comments: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
                }]
    });
    
    
//Compile a model from schema and assign to module.exports
module.exports = mongoose.model("Blog",blogSchema);
    