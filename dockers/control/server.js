'use strict';

var express = require("express");
var mongoose = require('mongoose');
var app = express();

app.use(express.static('public'));

mongoose.connect('mongodb://localhost/interface');

app.post('/api/producttype', function (req, res) {
    
    console.log(req);
    
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
