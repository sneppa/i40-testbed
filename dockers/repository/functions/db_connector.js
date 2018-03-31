var config = require('../config');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var _db;

module.exports = {
    connectToServer: function (callback) {
        MongoClient.connect(config.db.url, function (err, client) {
            _db = client.db(config.demo ? 'demorepo' : config.db.name);
            return callback(err);
        });
    },
    getDb: function () {
        return _db;
    },
    getProduct: async function (idproduct) {
        var products = _db.collection('products');

        // Falls URI übergeben, dann zu MongoID ändern
        if (idproduct.substr(0, 8) == "PRODUCT_")
            idproduct = idproduct.substr(8);

        return await products.findOne({"_id": new mongodb.ObjectID(idproduct)});
    },
    updateProduct: function (product, callback) {
        var products = _db.collection('products');
//        console.log("Update: "+product.name);
//        console.log(product);
        var updateId = product._id;
        delete product._id;
        products.updateOne({"_id": new mongodb.ObjectID(updateId)}, {$set: product}, function (err, result) {
            product._id = updateId;
            callback(err, result);
        });
    },
    deleteProduct: function (idproduct, callback) {
        var products = _db.collection('products');
        console.log("Delete: "+idproduct);
        products.remove({"_id": new mongodb.ObjectID(idproduct)}, function (err, result) {
            callback(err, result);
        });
    }
};