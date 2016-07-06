
var app = require('./helpers/server');
var snapsniff = require('../lib/index');
var assert = require('assert');

var testPort = 9999;

describe('snap-sniff', function() {
    var server;

    before(function(done) {
        server = app.listen(testPort, done);
    });

    after(function(done) {
        server.close(done);
    });

    it('should load the hello page', function(done) {
        assert(1 === 0);
    });

});