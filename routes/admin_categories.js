var express = require('express');
var router = express.Router();

// Get Page Model
var Category = require('../models/category');

/* 
* GET category index
*/
router.get('/', function(req,res){
    Category.find(function(err,categories){
        if(err) return console.log(err);
        res.render('admin/categories', {
            categories : categories
        });
    });
});

/* 
* GET category page
*/
router.get('/add-category', function(req,res){
    var title = '';

    res.render('admin/add_category',{
        title : title,
    });
});


/* 
* POST add category
*/
router.post('/add-category', function(req,res){
    var title= req.body.title;
    var slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    
    Category.findOne({slug : slug}, function(err, category){
        if(category){
            req.flash('danger','category slug exists, choose another');
            res.render('admin/add_category',{
                title : title,
                slug: slug
            });
        }
        else{
            var category = new Category({
                title : title,
                slug : slug
            });

            category.save(function(err){
                if(err) return console.log(err);

                req.flash('success','category added');

                res.redirect('/admin/categories');
            });
        }
    });
});


/* 
* GET edit category
*/
router.get('/edit-category/:id', function(req,res){
    Category.findOne({_id : req.params.id}, function(err,page){
        if(err) 
            return console.log(err);

        res.render('admin/edit_category',{
            title : page.title,
            slug: page.slug,
            content: page.content,
            id : page._id
        });
    });
});

/* 
* POST edit category
*/
router.post('/edit-category/:id', function(req,res){
    var title= req.body.title;
    var slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    var id= req.params.id;
    Category.findOne({slug : slug, _id: {'ne':id}}, function(err,category){
        if(category){
            req.flash('danger','category title exists, choose another');
            res.render('admin/edit_category',{
                title : title,
                id : id
            });
        }
        else{
            Category.findById(id, function (err, category) {
                if (err)
                    return console.log(err);

                category.title = title;
                category.slug = slug;

                category.save(function (err) {
                    if (err)
                        return console.log(err);

                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                                req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success', 'Category edited!');
                    res.redirect('/admin/categories/edit-category/' + id);
                });

            });


        }
    });
});

/* 
* GET delete page
*/
router.get('/delete-category/:id', function(req,res){
    Category.findOneAndDelete(req.params.id, function(err){
        if(err) return console.log(err);
        
        Category.find({}).sort({sorting: 1}).exec(function (err, category) {
        if (err) {
            console.log(err);
        } else {
        }
    });
    res.redirect('/admin/categories/');

    });
});

module.exports = router;