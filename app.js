var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
var config= require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var passport = require('passport');

/*MongoClient.connect(config.database, { useNewUrlParser: true }, function(err,db){
    if(err){
        console.log(err);
    }
    else {
        console.log('connected to '+ config.database);
        db.close();
    }
});*/

mongoose.connect(config.database, { useNewUrlParser: true });
var db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log('connected to mongo db');
});

//Init app
var app = express();

//View Engine set up
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

//Set the public folder
app.use(express.static(path.join(__dirname,'public')));

//Get Page Model
var Page= require('./models/page');

//Pass all pages to pass to the header
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

//Express Fileupload middleware
app.use(fileUpload());

//Set bodyParser
app.use(bodyParser.urlencoded({ extended: false}));

//parse application/json
app.use(bodyParser.json());

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }));

  // Express Validator middleware
//app.use(express.json());

// Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
 });
  

//Set routes
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var pages = require('./routes/page.js');
var products = require('./routes/products.js');
var adminPages = require('./routes/admin_pages.js');
var categoryPages = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/users',users);
app.use('/products',products);
app.use('/admin/products',adminProducts);
app.use('/admin/categories', categoryPages);
app.use('/admin/pages',adminPages);
app.use('/',pages);

//start your server
var port =3000;
app.listen(port, function(){
    console.log("Server Listening to port "+ port);
});