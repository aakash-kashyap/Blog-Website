//======Setup=======
var express          = require("express"),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    app              = express(),
    User             = require("./models/userModel"),
    Comment          = require("./models/commentModel"),
    Blog             = require("./models/blogModel");
    

mongoose.connect("mongodb://localhost/blog_app");  //connect to the DB
// mongoose.connect("mongodb://aakash:dbpswd@ds137271.mlab.com:37271/blog_mongodb");  //connect to the DB
app.set("view engine", "ejs");  
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());



//======================================
// Passport configuration

app.use(require("express-session")({
    secret: "This can be any thing you want for encryption purpose!!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//======================================

// middelware sending current user info to all routes
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   next();
});




// Blog.create({
//     title: "Test Blog",
//     image: "https://nonprofitorgs.files.wordpress.com/2010/07/blog.jpg",
//     body: "Hello this is test blog post!"
// });

//=============Routes===============

app.get("/",function(req, res){
    res.redirect("/blogs");
});

//=============Authentication Routes============================================
//-----Show signup form-------

app.get("/blogs/signup", function(req,res){
   res.render("signup"); 
});

app.post("/blogs/signup", function(req,res){
   //signup logic 
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        } 
        passport.authenticate("local")(req,res, function(){
            res.redirect("/blogs");    
        });
    });
});



app.get("/blogs/login", function(req,res){
   res.render("login"); 
});


//app.post("/blogs/login", middelware, callback function)-----------

app.post("/blogs/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/blogs/login"
}), function(req, res) {});




app.get("/blogs/logout", function(req,res){
    req.logout();
    res.redirect("/blogs");
});
//==============================================================================


//-----------index_route----------
app.get("/blogs",function(req, res){
    
    Blog.find({}, function(err, blogs){
       if(err){
           console.log("Error");
       } 
       else{
        //   console.log(blogs);
           res.render("index",{ blogs: blogs});
       }
    });
});

//-----About Route-------
app.get("/blogs/about",function(req,res){
    res.render("about");
})

//--------New_route---------
app.get("/blogs/new", isLogedIn ,function(req,res){
    res.render("new");
})

//--------Create_route----------
app.post("/blogs",function(req,res){
    //create new blog
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    
    Blog.create(req.body.blog, function(err,newBlog){
     if(err){
         res.render("new");
     }
     else{
         //redirects to the index
        newBlog.author.username = req.user.username;
        newBlog.author.id = req.user._id;
        newBlog.save();
        //  console.log("-------------------New blog -----------------------");
        //  console.log(newBlog);
         res.redirect("/blogs")
     }
    });
});

//---------Show Route------------
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            res.redirect("/home");
        }
        else{
            // console.log(foundBlog);
            res.render("show",{blog: foundBlog});
        }
    });
});

//-------Edit Route-------
app.get("/blogs/:id/edit",function(req,res){
    console.log("get request happened");
    Blog.findById(req.params.id, function(err, editBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog: editBlog});
        }
    });
});

//------Update Route-------
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });  
});


//--------Delete Route------------
app.delete("/blogs/:id", function(req,res){
        //destroy blog
        
        Blog.findByIdAndRemove(req.params.id, req.body.blog, function(err){
            if(err){
                res.redirect("/blogs");
            }
            else{
                //redirect to home page
                res.redirect("/blogs");
            }
    });  
        
});


//====================Comments route=============

app.post("/blogs/:id/comments",isLogedIn, function(req,res){
    //find blog using id
     Blog.findById(req.params.id, function(err, editedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            // console.log(req.body.comment);
            //Create comment
            Comment.create(req.body.comment, function(err , comment){
                if(err){
                    console.log(err);    
                }
                else{
                    //add username and id in comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    
                    //save comment
                    comment.save();
    
                    //add comment to blog model
                    editedBlog.comments.push(comment);
                    editedBlog.save();
                    res.redirect("/blogs/"+ editedBlog._id );
                }
            })
        }
    });
    
    
});


//===============================
//----------Middelware----------

function isLogedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/blogs/login");
}


//========Start Server========

app.listen(8000,'localhost', function(){
    console.log("Server is listening...");
});