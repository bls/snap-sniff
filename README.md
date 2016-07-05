# snap-sniff

Load a web page, take a screenshot (snap) and create a har file of network transfers (sniff).

## Quick start - local 

Requires node.js >= 4.0.0.

```sh
npm install -g snap-sniff
snap-sniff https://amazon.com amazon.png amazon.har
```

## Quick start - docker

docker run blairs/snap-sniff https://amazon.com amazon.png amazon.har

## Docker - roll your own

To build a docker image:

```sh
git clone https://github.com/bls/snap-sniff.git
cd snap-sniff
docker build -t snap-sniff docker 
docker run -v `pwd`:/data snap-sniff http://amazon.com amazon.png amazon.har
```

Note: Docker invocations have the "--xvfb" argument supplied automatically, because SlimerJS needs
a frame buffer.

## AWS Lambda

Work in progress, check back soon.

## Credits

This is based on url-to-image with added code from PhantomJS "netsniff" example. Then discovered 
there's no way to log the response content in PhantomJS without using an external proxy.  So switched 
from PhantomJS to SlimerJS which can save content.

* https://github.com/kimmobrunfeldt/url-to-image - Original code
* https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js - HAR saving
* http://darrendev.blogspot.com.au/2013/11/saving-downloaded-files-in-slimerjs-and.html - Saving content with SlimerJS

## Notes

SlimerJS doesn't *quite* run headless, so need xvfb or a real window system.

Mean data output sizes for Alexa top 1000:

* PNG screenshots - 2.5MB
* Compressed har files (bzip2) - 2.3MB
* Uncompressed har files - 5.6MB

