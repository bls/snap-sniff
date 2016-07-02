var url="http://www.google.com/";

var fs=require('fs');
var page = require('webpage').create();

fs.makeTree('contents');

page.captureContent = [ /.*/ ];

page.onResourceReceived = function(response) {
//console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
    if(response.stage!="end" || !response.bodySize)return;

    var matches = response.url.match(/[/]([^/]+)$/);
    var fname = "contents/"+matches[1];

    console.log("Saving "+response.bodySize+" bytes to "+fname);
    fs.write(fname,response.body);
};

page.onResourceRequested = function(requestData, networkRequest) {
//console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
};

page.open(url,function(){
    phantom.exit();
});
