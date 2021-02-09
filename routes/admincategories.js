const express = require("express");
const router = express.Router();
const Category = require('../models/categories')

var auth = require('../dbConfig/auth')
var isAdmin = auth.isAdmin;

// get home page
router.get("/", isAdmin, (req, res) => {
  Category.find((err, categories) => {
    if (err) return console.log(err)
    else {
      res.render('admin/categories/categories', {
        categories: categories
      })
    }
  })
});

//get add categories
router.get("/add-category", isAdmin, (req, res) => {
  var title = "";

  res.render("admin/categories/add-category", {
    title: title
  });
});

//get edit page
router.get('/edit-category/:id', isAdmin, (req, res) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) return console.log(err)
    else {
      res.render('admin/categories/edit-category', {
        title: category.title,
        id: category._id
      })
    }
  })
})

//post add category
router.post('/add-category', (req, res) => {
  req.checkBody('title', 'Title Must Have A Value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/categories/add-category', {
      errors: errors,
      title: title
    })
  } else {
    Category.findOne({slug: slug}, (err, categories) => {
      if (categories) {
        req.flash('danger', 'Category Title Is Exist, Please Choose Other');
        res.render('admin/categories/add-category', {
          title: title
        })
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });

        category.save(err => {
          if (err) return console.log(err)
          else {

            Category.find((err, categories) => {
              if (err) return console.log(err)
              else {
                req.app.locals.categories = categories
              }
            })

            req.flash('success', 'Category Added')
            res.redirect('/admin/categories')
          }
        })
      }
    })
  }
});


// post edit page
router.post('/edit-category/:id', (req, res) => {
  req.checkBody('title', 'Title Must Have  Value').notEmpty()

  var title = req.body.title
  var slug = title.replace(/\s+/g, '-').toLowerCase()
  var id = req.params.id

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/categories/edit-category', {
      errors: errors,
      title: title,
      id: id
    })
  } else {
    Category.findOne({slug: slug, _id: {'$ne': id}}, (err, category) => {
      if (err) return console.log(err)
      else if (category) {
        req.flash('danger', 'Category Title Is Exist, Please Choose Another')
        res.render('admin/categories/edit-category', {
          title: title,
          id: id
        })
      } else {
        Category.findById(id, (err, category) => {
          if (err) return console.log(err)
          else {
            category.title = title

            category.save(err => {
              if (err) return console.log(err)
              else {

                Category.find((err, categories) => {
                  if (err) return console.log(err)
                  else {
                    req.app.locals.categories = categories
                  }
                })

                req.flash('success', 'Category Edited')
                res.redirect(`/admin/categories/edit-category/${id}`)
              }
            })
          }
        })
      }
    })
  }

})

// delete page
router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err, category)=> {
    if (err) return console.log (err)
    else {

      Category.find((err, categories) => {
        if (err) return console.log(err)
        else {
          req.app.locals.categories = categories
        }
      })

      req.flash('info', "Category Deleted")
      res.redirect('/admin/categories')
    }
  })
})

module.exports = router;
