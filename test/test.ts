
import * as http from 'http';
import * as assert from 'assert';
import { app } from './helpers/server';

var snapsniff = require('../lib/index');

let testPort = 9999;

describe('snap-sniff', function() {
    let server: http.Server;

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