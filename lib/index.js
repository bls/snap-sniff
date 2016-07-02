#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('slimerjs');
var cliParser = require('./cli-parser');
var Xvfb = require('xvfb');

function render(url, filePath, opts) {
    opts = _.extend(cliParser.defaultOpts, opts);

    var args = [];
    if (_.isString(opts.phantomArguments)) {
        args = opts.phantomArguments.split(' ');
    }

    if (!_.startsWith(url, 'http')) {
        url = 'http://' + url;
    }

    args = args.concat([
        path.join(__dirname, 'snap-and-sniff.js'),
        url,
        filePath,
        opts.width,
        opts.height,
        opts.requestTimeout,
        opts.maxTimeout,
        opts.verbose,
        opts.fileType,
        opts.fileQuality,
        opts.cropWidth,
        opts.cropHeight,
        opts.cropOffsetLeft,
        opts.cropOffsetTop
    ]);

    var execOpts = {
        maxBuffer: Infinity
    };

    var killTimer;
    return new Promise(function(resolve, reject) {
        var child;
        killTimer = setTimeout(function() {
            killPhantom(opts, child);
            reject(new Error('Phantomjs process timeout'));
        }, opts.killTimeout);

        try {
            child = childProcess.spawn(phantomjs.path, args, {
                stdio: 'inherit'
            });
        } catch (err) {
            return Promise.reject(err);
        }

        function errorHandler(err) {
            // Remove bound handlers after use
            child.removeListener('close', closeHandler);
            reject(err);
        }

        function closeHandler(exitCode) {
            child.removeListener('error', errorHandler);
            if (exitCode > 0) {
                var err;
                if (exitCode === 10) {
                    err = new Error('Unable to load given url: ' + url);
                }
                reject(err);
            } else {
                resolve(exitCode);
            }
        }

        child.once('error', errorHandler);
        child.once('close', closeHandler);
    }).then(function() {
        clearTimeout(killTimer);
    }).catch(function(err) {
        console.log('Oops: ' + err);
        clearTimeout(killTimer);
    });
}

function killPhantom(opts, child) {
    if (child) {
        var msg = 'Phantomjs process didn\'t finish in ' +
            opts.killTimeout + 'ms, killing it..';
        console.error(msg);

        child.kill();
    }
}

function main(opts) {
    return render(opts.url, opts.path, opts)
        .catch(function(err) {
            console.error('\nTaking screenshot failed with error:');
            if (err && err.message) {
                console.error(err.message);
            } else if (err) {
                console.error(err);
            } else {
                console.error('No error message available');
            }

            process.exit(2);
        });
}

function xvfbKill() {
    xvfb.stop(function(err) {
        if(err) {
            console.log("Error stopping xvfb: " + err);
        }
    });
}

if (require.main === module) {
    var opts;
    try {
        opts = cliParser.getOpts();
    } catch (err) {
        if (err.argumentError) {
            console.error(err.message);
            process.exit(1);
        }

        throw err;
    }

    if(opts.xvfb) {
        var xvfb = new Xvfb();
        xvfb.start(function(err, xvfbProcess) {
            if(err) {
                console.log("Error starting xvfb: " + err);
            } else {
                main(opts).then(xvfbKill).catch(xvfbKill);
            }
        });
    } else {
        main(opts);
    }
}

module.exports = render;