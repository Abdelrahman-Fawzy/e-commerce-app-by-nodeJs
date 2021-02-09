const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title : {
        type : String,
        required: true
    },
    slug : {
        type : String
    },
    description : {
        type : String,
        required: true
    },
    category : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    image : {
        type : String
    },
    fileName : {
        type : String,
        required: true
    }
});

const Product = module.exports = mongoose.model('product', productSchema)