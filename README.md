# snap-and-sniff
Load a web page, save a screenshot and save a HAR file

## Credits

* https://github.com/kimmobrunfeldt/url-to-image - Original code
* https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js - HAR saving
* http://darrendev.blogspot.com.au/2013/11/saving-downloaded-files-in-slimerjs-and.html - Saving content with SlimerJS

## Installation

Run: `npm install -g bls/snap-and-sniff`

Requires node.js >= 4.0.0.

## Docker

To build a docker image:

```sh
git clone https://github.com/bls/snap-and-sniff.git
cd snap-and-sniff
docker build -t ssnap docker 
```

To run via docker:

```sh
docker run -v `pwd`:/data ssnap http://amazon.com amazon.png
```

Note: Docker invocations have the "--xvfb" argument supplied automatically, because SlimerJS needs
a frame buffer.

## Notes

Took url-to-image and added code from phantomjs "netsniff" example. Then discovered there's no way
to log the response content... :(   So switched to SlimerJS which can save content.

This works, but slimerjs doesn't *quite* run headless, so need xvfb or a real window system.
