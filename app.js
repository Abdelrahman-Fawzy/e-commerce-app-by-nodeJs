const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload')
const passport = require('passport')

require('./dbConfig/dbConfig')
require('./dbConfig/passport')(passport)

// init appliction
const app = express();

// init views for front-end
app.set('view engine', 'ejs')

// init static folders
app.use('/public', express.static(__dirname + '/public/'))
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css/'))

// set global error variable
app.locals.errors = null

//get models
var Page = require('./models/pages');
var Category = require('./models/categories')

//Get all models to the header.ejs
Page.find({}).exec((err, pages) => {
  if (err) return console.log(err)
  else {
    app.locals.pages = pages;
  }
});

Category.find((err, categories) => {
  if (err) return console.log(err)
  else {
    app.locals.categories = categories
  }
})

//parsing middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// sessions
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

//validator
app.use(expressValidator({
  customValidators : {
    isImage : function (value, fileName) {
      var extension = (path.extname(fileName)).toLowerCase();
      switch (extension) {
        case '.jpg' : 
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default :
          return false
      }
    }
  }
}));

// messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport middleware
app.use(passport.initialize());
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null
  next()
})

//fileUpload Middleware
app.use(fileUpload());

// routes
const pages = require('./routes/pages')
const adminPage = require('./routes/adminPages')
const categoryPage = require('./routes/admincategories')
const productPage = require('./routes/adminProducts')
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');

app.use('/admin/pages', adminPage)
app.use('/admin/categories', categoryPage)
app.use('/admin/products', productPage)
app.use('/cart', cart)
app.use('/products', products)
app.use('/users', users)
app.use('/', pages)

// init the server
const port = 5050
app.listen(port, () => console.log(`Server Started at Port ${port}`))
