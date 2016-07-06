var express = require('express');

var app = express();

app.all('/reflect', function(req, res) {
    res.json({
        protocol: req.protocol,
        method:   req.method,
        query:    req.query,
        body:     req.body,
        headers:  req.headers
    });
});

app.all('/not-found', function(req, res) {
    res.json(404, {status: 404});
});

app.get('/hello', function(req, res) {
    return "<html><head><title>hello</title></head><body><h1>hello</h1></body></html>";
});

module.exports = app;
