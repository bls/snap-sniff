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

```sh
git clone https://github.com/bls/snap-and-sniff.git
cd snap-and-sniff
docker build -t ssnap docker 
docker run -v `pwd`:/data --rm ssnap --xvfb http://amazon.com amazon.png
```

## Notes

Took url-to-image and added code from phantomjs "netsniff" example. Then discovered there's no way
to log the response content... :(   So switched to SlimerJS which can save content.

This works, but slimerjs needs a window, so to be really headless, use xvfb-run.

