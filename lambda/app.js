
var ApiBuilder = require('claudia-api-builder'),
    api = new ApiBuilder();

api.get('/hello', function () {
  return 'hello world';
});

module.exports = api;
