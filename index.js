var express = require('express'),
    bodyParser = require('body-parser')
app = express(),
    config = {
        server: {
            ip: "127.0.0.1",
            port: "3500"
        }, 
        site:{
            dist: "_data/comments" 
        }
    };

app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(config.port, config.ip, function() {
    console.log('server listening on:', config.port, config.ip);
});

app.post('/post/comment', function(req, res) {
    var entry = req.body;
    console.log(req.body);
    res.json({
        data: "success"
    });
});
