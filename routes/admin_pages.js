var express = require('express');
var router = express.Router();

// Get Page Model
var Page = require('../models/page');

/* 
* GET page index
*/
router.get('/', function(req,res){
    Page.find({}).sort({sorting: 1}).exec(function(err,pages){
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/* 
* GET add page
*/
router.get('/add-page', function(req,res){
    var title = '';
    var slug = '';
    var content = '';

    res.render('admin/add_page',{
        title : title,
        slug: slug,
        content: content
    });
});


/* 
* POST add page
*/
router.post('/add-page', function(req,res){
    var title= req.body.title;
    var slug= req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug=="") slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    var content= req.body.content;

    
    Page.findOne({slug : slug}, function(err,page){
        if(page){
            req.flash('danger','page slug exists, choose another');
            res.render('admin/add_page',{
                title : title,
                slug: slug,
                content: content
            });
        }
        else{
            var page = new Page({
                title : title,
                slug : slug,
                content : content,
                sorting : 100
            });

            page.save(function(err){
                if(err) return console.log(err);
                
                Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                    if (err) {
                        console.log(err);
                    } else {
                        app.locals.pages = pages;
                    }
                });

                req.flash('success','page added');

                res.redirect('/admin/pages');
            });
        }
    });
});

/* 
* GET delete page
*/
router.get('/', function(req,res){
    res.send('Admin Area');
});


/* 
* SORT the pages
*/
function sorPages(ids, callback){
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                        ++count;
                        if (count >= ids.length) {
                            callback();
                        }
                    });
                });
        })(count);
    }
}
// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}


/* 
* POST reorder page
*/
router.post('/reorder-pages', function(req,res){
    var ids= req.body['id[]'];
    sortPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


/* 
* GET edit page
*/
router.get('/edit-page/:slug', function(req,res){
    Page.findOne({_id : req.params.slug}, function(err,page){
        if(err) 
            return console.log(err);

        res.render('admin/edit_page',{
            title : page.title,
            slug: page.slug,
            content: page.content,
            id : page._id
        });
    });
});

/* 
* POST edit page
*/
router.post('/edit-page/:slug', function(req,res){
    var title= req.body.title;
    var slug= req.params.slug;
    if(slug=="") slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    var id= req.body.id;
    var content= req.body.content;
    
    Page.findOne({slug : slug, _id: {'ne':id}}, function(err,page){
        if(page){
            req.flash('danger','page slug exists, choose another');
            res.render('admin/edit_page',{
                title : title,
                slug: slug,
                content: content,
                id : id
            });
        }
        else{
            Page.findById(id, function(err,page){
                if(err)
                    return console.log(err);
                page.title = title;
                page.slug = slug;
                page.content = content;

                page.save(function(err){
                    if(err) return console.log(err);

                Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                    if (err) {
                        console.log(err);
                    } else {
                        app.locals.pages = pages;
                        }
                });
    
                    req.flash('success','page added');
    
                    res.redirect('/admin/pages/edit-page/'+page.id);
                });
            });
            
        }
    });
});

/* 
* GET delete page
*/
router.get('/delete-page/:id', function(req,res){
    Page.findOneAndDelete(req.params.id, function(err){
        if(err) return console.log(err);
        
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        if (err) {
            console.log(err);
        } else {
            req.app.locals.pages = pages;
        }
    });
    res.redirect('/admin/pages/');

    });
});

module.exports = router;