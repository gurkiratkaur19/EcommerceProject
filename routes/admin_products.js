var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Product Model
var Product = require('../models/product');

// Get Category Model
var Category = require('../models/category');

/* 
* GET product index
*/
router.get('/', function(req,res){
    var count =0;
    Product.countDocuments(function(err, c){
        count = c;
    });

    Product.find(function(err, products){
        res.render('admin/products',{
            products : products,
            count : count
        });
    });
});

/* 
* GET add product
*/
router.get('/add-product', function(req,res){
    var title = '';
    var desc = '';
    var price = '';

    Category.find(function(err, categories){
        res.render('admin/add_product',{
            title : title,
            desc : desc,
            price : price,
            categories : categories
        });
    });
    
});


/* 
* POST add product
*/
router.post('/add-product', function(req,res){
    var title= req.body.title;
    var slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    if(slug=="") slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    var desc= req.body.desc;
    var category = req.body.category;
    var price = parseFloat(req.body.price).toFixed(2);
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";

    
    Product.findOne({slug : slug}, function(err,product){
        if(product){
            req.flash('danger','Product title exists, choose another');
            res.render('admin/add_product',{
                title : title,
                slug : slug,
                desc : desc,
                price : price,
                category : category
            });
        }
        else{
            var product = new Product({
                title : title,
                slug : slug,
                desc : desc,
                category : category,
                price : price,
                image : imageFile
            });

            product.save(function(err){
                if(err) return console.log(err);

                mkdirp('public/product_images/'+ product._id, function(err){
                    return console.log(err);

                });
                mkdirp('public/product_images/'+ product._id + '/gallery', function(err){
                    return console.log(err);
                    
                });
                mkdirp('public/product_images/'+ product._id + '/gallery/thumbs', function(err){
                    return console.log(err);
                    
                });

                if(imageFile != ''){
                    var productImage = req.files.image;
                    var path = 'public/product_images/'+ product._id + '/' + imageFile;

                    productImage.mv(path, function(err){
                        return console.log(err);
                    });
                }

                req.flash('success','product added');

                res.redirect('/admin/products');
            });
        }
    });
});


/* 
* GET edit product
*/
router.get('/edit-product/:id', function(req,res){
    Category.find(function(err, categories){
        Product.findById(req.params.id, function(err, p){
            if(err){
                console.log(err);
                res.redirect('admin/products');
            }
            else{
                var galleryDir = 'public/product_images/'+p._id+'/gallery';
                var gallery = null;

                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err);
                    }
                    else{
                        galleryImages = files ;
                        res.render('admin/edit_product',{
                            id : p._id,
                            title : p.title,
                            desc : p.desc,
                            price : p.price,
                            categories : categories,
                            category : p.category.replace(/\s+/g , '-').toLowerCase(),
                            image : p.image,
                            galleryImages: galleryImages
                        });
                    }
                });
            }

        });
       
    });

});

/* 
* POST edit product
*/
router.post('/edit-product/:id', function(req,res){
    var title= req.body.title;
    var slug= req.body.title.replace(/\s+/g, '-').toLowerCase();
    var desc= req.body.desc;
    var category = req.body.category;
    var price = parseFloat(req.body.price).toFixed(2);
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    var id = req.params.id;
    var pimage= req.param.pimage;


    Product.findById(id, function (err, p) {
        if (err)
            console.log(err);

        p.title = title;
        p.slug = slug;
        p.desc = desc;
        p.price = parseFloat(price).toFixed(2);
        p.category = category;
        if (imageFile != "") {
            p.image = imageFile;
        }

        p.save(function (err) {
            if (err)
                console.log(err);

            if (imageFile != "") {
                if (pimage != "") {
                    fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                        if (err)
                            console.log(err);
                    });
                }

                var productImage = req.files.image;
                var path = 'public/product_images/' + id + '/' + imageFile;

                productImage.mv(path, function (err) {
                    return console.log(err);
                });

            }

            req.flash('success', 'Product edited!');
            res.redirect('/admin/products/edit-product/' + id);
        });

    });
});

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {
    
        var productImage = req.files.file;
        var id = req.params.id;
        var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
        var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
    
        productImage.mv(path, function (err) {
            if (err)
                console.log(err);
    
            resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
                fs.writeFileSync(thumbsPath, buf);
            });
        });
    
        res.sendStatus(200);
    
    });

/*
 * GET delete image
 */
router.get('/delete-image/:image', function (req, res) {
    
        var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
        var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    
        fs.remove(originalImage, function (err) {
            if (err) {
                console.log(err);
            } else {
                fs.remove(thumbImage, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.flash('success', 'Image deleted!');
                        res.redirect('/admin/products/edit-product/' + req.query.id);
                    }
                });
            }
        });
    });

    /*
 * GET delete product
 */
router.get('/delete-product/:id', function (req, res) {
    
        var id = req.params.id;
        var path = 'public/product_images/' + id;
    
        fs.remove(path, function (err) {
            if (err) {
                console.log(err);
            } else {
                Product.findByIdAndRemove(id, function (err) {
                    console.log(err);
                });
                
                req.flash('success', 'Product deleted!');
                res.redirect('/admin/products');
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