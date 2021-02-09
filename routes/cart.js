const express = require('express');
const router = express.Router();

var Product = require('../models/products')

router.get('/add/:product', (req, res) => {
    var slug = req.params.product;

    Product.findOne({slug: slug}, (err, product) => {
        if (err) return console.log(err)

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                quantity: 1,
                price : parseFloat(product.price).toFixed(2),
                image : `/public/product_images/${product.fileName}/${product.image}`
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].quantity++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    quantity: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: `/public/product_images/${product.fileName}/${product.image}`
                });
            }
        }

        req.flash("success", "Product Added Successfully");
        res.redirect("back")
    });
});

router.get('/checkout', (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart
        res.redirect('/cart/checkout');
    } else {
        res.render('cartCheckout', {
            title: 'Check Out',
            cart : req.session.cart
        });
    }
});

router.get('/update/:product', (req, res) => {
    var cart = req.session.cart;
    var product = req.params.product;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == product) {
            switch (action) {
                case "add" :
                    cart[i].quantity++;
                    break;
                case "remove":
                    cart[i].quantity--;
                    if (cart[i].quantity < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete cart
                    break;
                default:
                    console.log("update problem")
                    break;
            }
            break;
        }
    }

    req.flash("success", "Cart Updated Successfully");
    res.redirect("/cart/checkout")
});

router.get('/clear', (req, res) => {

    delete req.session.cart;

    req.flash("success", "Cart Deleted");
    res.redirect("/cart/checkout");
})

module.exports = router