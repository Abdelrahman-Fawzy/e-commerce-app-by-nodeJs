const express = require("express");
const router = express.Router();
const fs = require('fs-extra')
const mkdirp = require('mkdirp')
const resizeImg = require('resize-img')

const Product = require('../models/products')
const Category = require('../models/categories');
const { route } = require("./pages");

var auth = require('../dbConfig/auth')
var isAdmin = auth.isAdmin;

// get home page
router.get("/", isAdmin, (req, res) => {
  var count;

  Product.count((err, c) => {
    count = c
  });

  Product.find((err, products) => {
    if (err) return console.log(err)
    else {
      res.render('admin/products/products', {
        products: products,
        count: count
      })
    }
  })
});

//get add product
router.get('/add-product', isAdmin, (req, res) => {
  var title = "";
  var description = "";
  var price = "";
  var fileName = "";

  Category.find((err, categories) => {
    if (err) return console.log(err)
    else {
      res.render('admin/products/add-product', {
        title : title,
        description: description,
        price: price,
        categories : categories,
        fileName: fileName
      })
    }
  })
});

//get edit product
router.get('/edit-product/:id', isAdmin, (req, res) => {
  var errors ;

  if (req.session.errors) errors = req.session.errors
  req.session.errors = null

  Category.find((err, categories) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        console.log(err)
        res.redirect('/admin/products')
      } else {
        var gallerydir = `public/product_images/${product.fileName}/gallery`;
        var galleyImages = null

        fs.readdir(gallerydir, (err, files) => {
          if (err) return console.log(err)
          else {
            galleyImages = files;

            res.render('admin/products/edit-product', {
              errors : errors,
              title: product.title,
              description: product.description,
              price: product.price,
              categories: categories,
              category: product.category.replace(/\s+/g, '-').toLowerCase(),
              image : product.image,
              galleyImages: galleyImages,
              fileName: product.fileName,
              id: req.params.id
            })
          }
        })
      }
    })
  })
})

//post add product
router.post('/add-product', (req, res) => {
  var imageFile = (req.files) ? req.files.image.name : "";

  req.checkBody('title', 'Title Must Have A Value').notEmpty();
  req.checkBody('description', 'Description Must Have A Value').notEmpty();
  req.checkBody('price', 'Price Must Have A Value').isDecimal();
  req.checkBody('image', 'You Must Upload An Image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var description = req.body.description;
  var category = req.body.category;
  var price = req.body.price;
  var fileName = title;

  var errors = req.validationErrors();

  if (errors) {
    Category.find((err, categories) => {
      if (err) return console.log(err)
      else {
        res.render('admin/products/add-product', {
          errors : errors,
          title : title,
          description: description,
          price: price,
          categories : categories,
          fileName : fileName
        })
      }
    })
  } else {
    Product.findOne({slug: slug}, (err, product) => {
      if (product) {
        req.flash('danger', 'Product Is Exist!');
        Category.find((err, categories) => {
          if (err) return console.log(err)
          else {
            res.render('admin/products/add-product', {
              errors : errors,
              title : title,
              description: description,
              price: price,
              categories : categories,
              fileName : fileName
            })
          }
        })
      } else {
        var price2 = parseFloat(price).toFixed(2)

        var product = new Product({
          title : title,
          slug: slug,
          description: description,
          price: price2,
          category : category,
          image: imageFile,
          fileName: fileName
        });

        product.save(function (err) {
          if (err) return console.log(err)
          else {
            mkdirp(`public/product_images/${product.fileName}`, (err) => {return console.log(err)})
            mkdirp(`public/product_images/${product.fileName}/gallery`, (err) => {return console.log(err)})
            mkdirp(`public/product_images/${product.fileName}/gallery/thumbs`, (err) => {return console.log(err)})

            if (imageFile != "") {
              var productImage = req.files.image;
              var path = `public/product_images/${product.fileName}/${imageFile}`;

              productImage.mv(path, (err) => {return console.log(err)})
            }

            req.flash('success', 'Product Added');
            res.redirect('/admin/products');
          }
        })
      }
    })
  }
})

//post edit product
router.post('/edit-product/:id', (req, res) => {
  var imageFile = (req.files) ? req.files.image.name : "";

  req.checkBody('title', 'Title Must Have A Value').notEmpty();
  req.checkBody('description', 'Description Must Have A Value').notEmpty();
  req.checkBody('fileName', 'File Name Must Have A Value').notEmpty();
  req.checkBody('price', 'Price Must Have A Value').isDecimal();
  req.checkBody('image', 'You Must Upload An Image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase()
  var description = req.body.description
  var category = req.body.category
  var price = req.body.price
  var pimage = req.body.pimage
  var fileName = req.body.fileName
  var id = req.params.id

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect(`/admin/products/edit-product/${id}`);
  } else {
    Product.findOne({slug: slug, _id:{'$ne': id}}, (err, product) => {
      if (err) return console.log(err);
      if (product) {
        req.flash('danger', 'Product Is Exist');
        res.redirect(`/admin/products/edit-product/${id}`)
      } else {
        Product.findById(id, (err, product) => {
          if (err) return console.log(err)
          else {
            product.title = title;
            product.slug = slug;
            product.description = description;
            product.price = parseFloat(price).toFixed(2);
            product.category = category;
            product.fileName = fileName;
            if (imageFile != "") {
              product.image = imageFile
            }

            product.save((err) => {
              if (err) return console.log(err)
              if (imageFile != "") {
                if (pimage != "") {
                  fs.remove(`public/product_images/${fileName}/${pimage}`, (err) => {
                    if (err) return console.log(err)
                  })
                }

                var productImage = req.files.image;
                var path = `public/product_images/${fileName}/${imageFile}`;

                productImage.mv(path, (err) => {return console.log(err)})

              }

              req.flash('success', 'Product Edited');
              res.redirect('/admin/products');
            })
          }
        })
      }
    })
  }

})

//post products gallery
router.post('/product-gallery/:fileName', (req, res) => {
  var productImage = req.files.file;
  var fileName = req.params.fileName;
  var path = `public/product_images/${fileName}/gallery/${productImage.name}`;
  var thumbsPath = `public/product_images/${fileName}/gallery/thumbs/${productImage.name}`;

  productImage.mv(path, (err) => {
    if (err) return console.log(err)
    else {
      resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then((buffer) => {
        fs.writeFileSync(thumbsPath, buffer);
      });
    }
  });

  res.sendStatus(200);
});

//delete Image
router.get('/delete-image/:image', (req, res) => {
  var originalImage = `public/product_images/${req.query.fileName}/gallery/${req.params.image}`;
  var thumbsPathImage = `public/product_images/${req.query.fileName}/gallery/thumbs/${req.params.image}`;

  fs.remove(originalImage, (err) => {
    if (err) return console.log(err)
    else {
      fs.remove(thumbsPathImage, (err) => {
        if (err) return console.log(err)
        else {
          req.flash('info', 'Image Deleted Successfuly');
          res.redirect('/admin/products/edit-product/'+ req.query.id)
        }
      })
    }
  })
});

//delete product
router.get('/delete-product/:id', (req, res) => {
  var id = req.params.id;
  var imageFileName = req.query.fileName;
  var path = `public/product_images/${imageFileName}`;

  console.log(path)

  fs.remove(path, (err) => {
    if (err) return console.log(err)
    else {
      Product.findByIdAndRemove(id, (err) => {
        if (err) return console.log(err)
      });

      req.flash('info', 'Product Deleted');
      res.redirect('/admin/products');
    }
  })
})

module.exports = router;
