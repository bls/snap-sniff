# snap-and-sniff
Load a web page, save a screenshot and save a HAR file

## Notes

Took url-to-image and added code from phantomjs "netsniff" example. Then discovered there's no way
to log the response content... :(

So, switched from PhantomJS to SlimerJS, used blog post here: http://darrendev.blogspot.com.au/2013/11/saving-downloaded-files-in-slimerjs-and.html

This works, but slimerjs needs a window, so to be really headless, use xvfb-run.

