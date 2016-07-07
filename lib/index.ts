#!/usr/bin/env node

import * as _ from 'lodash';
import * as child_process from 'child_process';
import * as path from 'path';

var phantomjs = require('slimerjs');
var cliParser = require('./cli-parser');
var Xvfb = require('xvfb');

function render(url: string, imagePath: string, harPath: string, opts: any): Promise<number> {
    opts = _.extend(cliParser.defaultOpts, opts);

    var args: string[] = [];
    if (_.isString(opts.phantomArguments)) {
        args = opts.phantomArguments.split(' ');
    }

    if (!_.startsWith(url, 'http')) {
        url = 'http://' + url;
    }

    args = args.concat([
        path.join(__dirname, 'snap-sniff.js'),
        url,
        imagePath,
        harPath,
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

    let execOpts = {
        maxBuffer: Infinity
    };

    let killTimer: number;

    return new Promise<number>(function(resolve, reject) {
        let child: child_process.ChildProcess;
        try {
            child = child_process.spawn(phantomjs.path, args, {
                stdio: 'inherit'
            });
        } catch (err) {
            reject(err);
        }

        killTimer = setTimeout(function() {
            killPhantom(opts, child);
            reject(new Error('Browser process timeout'));
        }, opts.killTimeout);


        function errorHandler(err: any) {
            // Remove bound handlers after use
            child.removeListener('close', closeHandler);
            reject(err);
        }

        function closeHandler(exitCode: number) {
            child.removeListener('error', errorHandler);
            if (exitCode > 0) {
                if(exitCode === 10) {
                    reject(new Error(`Unable to load given url: ${url}`));
                } else {
                    reject(new Error(`Browser exited with error code ${exitCode}`));
                }
            } else {
                resolve(exitCode);
            }
        }

        child.once('error', errorHandler);
        child.once('close', closeHandler);
    }).then(function() {
        clearTimeout(killTimer);
        return 8; // TODO: FIXME
    }).catch(function(err) {
        console.log('Oops: ' + err);
        clearTimeout(killTimer);
    });
}

function killPhantom(opts: any, child: child_process.ChildProcess) {
    if (child) {
        let msg = `Browser failed to exit within ${opts.killTimeout} ms, killing it`;
        console.error(msg);
        child.kill();
    }
}

function main(opts: any) {
    return render(opts.url, opts.imagePath, opts.harPath, opts)
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


if (require.main === module) {
    let opts: any;
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
        let xvfb = new Xvfb();

        function xvfbKill() {
            xvfb.stop(function(err: any) {
                if(err) {
                    console.log("Error stopping xvfb: " + err);
                }
            });
        }

        xvfb.start(function(err: Error, xvfbProcess: child_process.ChildProcess) {
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