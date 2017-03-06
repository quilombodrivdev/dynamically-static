var express = require('express'),
    bodyParser = require('body-parser')
fs = require('fs')
app = express(),
    config = {
        server: {
            ip: "127.0.0.1",
            port: "3500"
        },
        site: {
            dist: "/_data/comments/"
        }
    };

app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(config.server.port, config.server.ip, function() {
    console.log('server listening on:', config.server.port, config.server.ip);
});

app.post('/post/comment', function(req, res) {
    var entry = req.body;
    var hash = new Date().getTime().toString();
    var distFile = config.site.dist + entry.slug + "/" + hash + ".yml";
    //fs.writeFile("", "Hey there!", function(err) {
        //if (err) {
            //return console.log(err);
        //}

        //console.log("The file was saved!");
    //});
    res.json({
        data: "success"
    });
});
