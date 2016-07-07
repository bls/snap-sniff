import * as express from 'express';

export let app: express.Application = express();

app.all('/reflect', function(req: express.Request, res: express.Response) {
    res.json({
        protocol: req.protocol,
        method:   req.method,
        query:    req.query,
        body:     req.body,
        headers:  req.headers
    });
});

app.all('/not-found', function(req, res) {
    res.json(404, {status: 404});
});

app.get('/hello', function(req, res) {
    return "<html><head><title>hello</title></head><body><h1>hello</h1></body></html>";
});
