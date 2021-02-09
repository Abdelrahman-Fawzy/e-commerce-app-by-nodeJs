const express = require('express');
const router = express.Router();
var fs = require('fs-extra')

var Product = require('../models/products')
var Category = require('../models/categories');

router.get('/', (req, res) => {

    Product.find((err, products) => {
        if (err) return console.log(err)
        else {
            res.render('allProducts', {
                title : "All Products",
                products: products
            })
        }
    });
});

router.get('/:category', (req, res) => {
    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, category) => {
        Product.find({category: categorySlug}, (err, products) => {
            if (err) return console.log(err)
            else {
                res.render('productsByCategories', {
                    title: category.title,
                    products: products
                })
            }
        })
    })
});

router.get('/:category/:product', (req, res) => {
    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false; 

    Product.findOne({slug: req.params.product}, (err, product) => {
        if (err) return console.log(err)
        else {
            var galleryDir = `public/product_images/${product.fileName}/gallery`;

            fs.readdir(galleryDir, (err, files) => {
                if (err) return console.log(err);
                else {
                    galleryImages = files;

                    res.render('product', {
                        title : product.title,
                        galleryImages: galleryImages,
                        product: product,
                        loggedIn: loggedIn
                    });
                }
            })
        }
    })
})

module.exports = router