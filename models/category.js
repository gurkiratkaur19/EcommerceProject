var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

//Category schema
var CategorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }
});

var Category = module.exports= mongoose.model('categories',CategorySchema);