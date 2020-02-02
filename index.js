var express = require('express');

// App setup
var app = express();
var server = app.listen(7777, function () {
    console.log('listening for requests on port 7777');
});

// Static files
app.use(express.static('public'));