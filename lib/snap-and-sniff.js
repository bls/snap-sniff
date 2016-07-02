// PhantomJS script
// Takes screeshot of a given page. This correctly handles pages which
// dynamically load content making AJAX requests.

// Instead of waiting fixed amount of time before rendering, we give a short
// time for the page to make additional requests.

// "use strict";

// Phantom internals
var system = require('system');
var webPage = require('webpage');
var fs = require('fs');

function main() {
    // I tried to use yargs as a nicer commandline option parser but
    // it doesn't run in phantomjs environment
    var args = system.args;
    var opts = {
        url: args[1],
        filePath: args[2],
        width: args[3],
        height: args[4],
        requestTimeout: args[5],
        maxTimeout: args[6],
        verbose: args[7] === 'true',
        fileType: args[8],
        fileQuality: args[9] ? args[9] : 100,
        cropWidth: args[10],
        cropHeight: args[11],
        cropOffsetLeft: args[12] ? args[12] : 0,
        cropOffsetTop: args[13] ? args[13] : 0
    };

    renderPage(opts);
}

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

function createHAR(address, title, startTime, endTime, resources)
{
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url.match(/(^data:image\/.*)/i)) {
            return;
        }

        var entry = {
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: endReply.bodySize,
                content: {
                    size: endReply.bodySize,
                    mimeType: endReply.contentType || "",
                    encoding: 'base64',
                    text: window.btoa(endReply.body)
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        };

        entries.push(entry);
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: endTime - startTime
                }
            }],
            entries: entries
        }
    };
}


function renderPage(opts) {
    var requestCount = 0;
    var forceRenderTimeout;
    var dynamicRenderTimeout;

    // HAR
    var resources = [];
    var startTime,
        endTime,
        pageTitle;

    var renderStarted = false;

    var page = webPage.create();

    // Tell slimer to capture content
    page.captureContent = [ /.*/ ];

    page.viewportSize = {
        width: opts.width,
        height: opts.height
    };

    page.onLoadStarted = function () {
        startTime = new Date();
    };

    // Silence confirmation messages and errors
    page.onConfirm = page.onPrompt = function noOp() {};
    page.onError = function(err) {
        log('Page error:', err);
    };

    page.onResourceRequested = function(request) {
        log('->', request.method, request.url);
        requestCount += 1;
        clearTimeout(dynamicRenderTimeout);

        // HAR
        resources[request.id] = {
            request: request,
            startReply: null,
            endReply: null
        };
    };

    page.onResourceReceived = function(response) {
        if (!response.stage || response.stage === 'end') {
            log('<-', response.status, response.url);
            requestCount -= 1;
            if (requestCount === 0) {
                dynamicRenderTimeout = setTimeout(renderAndExit, opts.requestTimeout);
            }
        }

        // HAR
        if (response.stage === 'start') {
            resources[response.id].startReply = response;
        }
        if (response.stage === 'end') {
            resources[response.id].endReply = response;
        }
    };

    page.open(opts.url, function(status) {
        if (status !== 'success') {
            log('Unable to load url:', opts.url);
            phantom.exit(10);
        } else {
            forceRenderTimeout = setTimeout(renderAndExit, opts.maxTimeout);
        }
    });

    function log() {
        // PhangomJS doesn't stringify objects very well, doing that manually
        // if (opts.verbose) {
            var args = Array.prototype.slice.call(arguments);

            var str = '';
            args.forEach(function(arg) {
                if (isString) {
                    str += arg;
                } else {
                    str += JSON.stringify(arg, null, 2);
                }

                str += ' '
            });

            console.log(str);
        // }
    }

    function renderAndExit() {
        if(renderStarted) {
            return;
        }
        renderStarted = true;

        log('Render screenshot..');
        /*
        if(opts.cropWidth && opts.cropHeight) {
            log("Cropping...");
            var clipRect = {top: opts.cropOffsetTop, left: opts.cropOffsetLeft, width: opts.cropWidth, height: opts.cropHeight};
            log(JSON.stringify(clipRect, undefined, 4));
            page.clipRect = clipRect;
        }
        */

        var renderOpts = {
            fileQuality: opts.fileQuality
        };

        if(opts.fileType) {
            log("Adjusting File Type...");
            renderOpts.fileType = opts.fileType;
        }

        page.render(opts.filePath, renderOpts);

        log('Save HAR file..');
        endTime = new Date();
        pageTitle = page.evaluate(function () {
            return document.title;
        });
        var har = createHAR(opts.url, pageTitle, startTime, endTime, resources);
        fs.write('output.har',JSON.stringify(har, undefined, 4));

        log('Done.');
        phantom.exit();
    }
}

function isString(value) {
    return typeof value == 'string'
}

main();