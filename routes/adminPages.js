const express = require("express");
const router = express.Router();
const Page = require('../models/pages')

var auth = require('../dbConfig/auth')
var isAdmin = auth.isAdmin;

// get home page
router.get("/", isAdmin, (req, res) => {
  Page.find({}).sort({sorting: 1}).exec((err, pages) => {
    res.render('admin/pages/pages', {
      pages : pages
    })
  })
});

//get add page
router.get("/add-page", isAdmin, (req, res) => {
  var title = "";
  var slug = "";
  var content = "";

  res.render("admin/pages/add-page", {
    title: title,
    slug: slug,
    content: content,
  });
});

//get edit page
router.get('/edit-page/:id', isAdmin, (req, res) => {
  Page.findById(req.params.id, (err, page) => {
    if (err) return console.log(err)
    else {
      res.render('admin/pages/edit-page', {
        id : page._id,
        title : page.title,
        slug : page.slug,
        content: page.content
      });
    }
  });
})

//post add page
router.post("/add-page", (req, res) => {
  req.checkBody("title", "Title Must Have A Value").notEmpty();
  req.checkBody("content", "Content Must Have A Value").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/pages/add-page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
    });
  } else {
    Page.findOne({slug: slug}, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.');
        res.render("admin/pages/add-page", {
          title: title,
          slug: slug,
          content: content,
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });

        page.save(function (err) {
          if (err) return console.log(err);

          Page.find({}).exec((err, pages) => {
            if (err) return console.log(err)
            else {
              req.app.locals.pages = pages
            }
          })

          req.flash('success', 'Page Added!');
          res.redirect('/admin/pages')
        })
      }
    })
  }
});

// post edit page
router.post('/edit-page/:id', (req, res) => {
  req.checkBody('title', "Title Must Have A Value").notEmpty()
  req.checkBody('content', "Content Must Have A Content").notEmpty()

  var title = req.body.title
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase()
  var content = req.body.content
  var id = req.params.id

  var errors = req.validationErrors()

  if(errors) {
    res.render("admin/pages/edit-page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    })
  } else {
    Page.findOne({slug: slug, _id:{'$ne': id}}, (err, page) => {
      if(page) {
        req.flash('danger', "Page is exist, Choose another.")
        res.render('admin/pages/edit-page', {
          id: id,
          title: title,
          slug: slug,
          content: content
        })
      } else {
        Page.findById(id, (err, page) => {
          if (err) return console.log(err)
          else {
            page.title = title;
            page.slug = slug;
            page.content = content;

            page.save(err => {
              if (err) return console.log(err)
              else {

                Page.find({}).exec((err, pages) => {
                  if (err) return console.log(err)
                  else {
                    req.app.locals.pages = pages;
                  }
                })

                req.flash('success', "page edited");
                res.redirect(`/admin/pages/edit-page/${id}`)
              }
            })
          }
        })
      }
    })
  }
})

// delete page
router.get('/delete-page/:id', isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err, page) => {
    if (err) return console.log(err)
    else {

      Page.find({}).exec((err, pages) => {
        if (err) return console.log(err)
        else {
          req.app.locals.pages = pages;
        }
      })

      req.flash("info", "Page Deleted")
      res.redirect("/admin/pages")
    }
  })
})

module.exports = router;
