var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    app = express(),
    config = {
        server: {
            ip: "127.0.0.1",
            port: "3500"
        },
        site: {
            dist: "_data/comments/"
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
    console.log(req.body);
    var hash = new Date().getTime().toString();
    var distFolder = config.site.dist + entry.slug + "/";
    var distFile = distFolder + hash + ".yml";
    var data = "";
    for (var key in entry) {
        data += key + ":" + " " + entry[key] + " \n";
    }

    mkdirp(distFolder, function(err) {
        if (err) res.json({
            data: "error"
        });

        fs.writeFile(distFile, data, function(err) {
            if (err) {
                return console.log(err);
            }

            res.json({
                data: "success"
            });
        });

    })

});
