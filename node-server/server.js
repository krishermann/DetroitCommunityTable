var path = require('path'),
    // fs = require('fs'),
    express = require('express'),
    app = express(),
    http = require('http'),
    yelp = require('./yelp'),
    crypto = require('crypto'),
    bodyParser = require('body-parser'),
    storage = require('node-persist'),
    http_port = process.env.HTTP_PORT || 8080,
    http_server = http.createServer(app);

//initializes, names, and types 'persist' JSON
storage.initSync();
storage.setItem('neverland', []);

//tell express that only JSON can be parsed from req.body
app.use(bodyParser.json());
//tells node/express which files to use by declaring absolute path
app.use(express.static(path.resolve(__dirname + '/../')));

//serves index at any route(i think) --ASK kj about this
app.get('/api/', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../index.html'));
});

//maps to the contents of our retrieveYelp function, returns the 
//search terms to be delivered by the api service all over the app
app.get('/api/yelp/search', function(req, res) {
    return yelp.search({
            term: 'Bars',
            location: req.query.location
        })
        .then(function(data) {
            res.send(data);
        })
        .catch(function(err) {
            res.send(err);
        });
});

//maps to the add functionality so we can give
app.post('/api/restaurants/add', function(req, res) {
    var neverland = storage.getItem('neverland') || [];
    neverland.push({
        // id: crypto.randomBytes(20).toString('hex'),
        name: req.body.restaurant
    });
    storage.setItem('neverland', neverland);
    res.send(neverland);
});

app.get('/api/restaurants/saved', function(req, res) {
    var neverland = storage.getItem('neverland') || [];
    res.send(neverland);
});

http_server.listen(http_port);
console.log('Listening for http on ' + http_port);