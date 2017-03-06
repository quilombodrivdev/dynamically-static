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
    var hash = new Date().getTime().toString();
    var distFolder = config.site.dist + entry.slug + "/";
    var distFile = distFolder + hash + ".yml";
    var data = "";
    for (var key in entry) {
        data += key + ":" + " " + entry[key] + " \n";
    }

    this._fileCreation(distFolder, distFile, data)
        .then(function(){
            console.log("file successfully created"); 

            res.json({"success":"success"});
        });

});

_fileCreation = function(distFolder, distFile, data) {
    return new Promise(function(resolve, reject) {
        mkdirp(distFolder, function(err) {
            if (err) reject("file creation"); 

            fs.writeFile(distFile, data, function(err) {
                if (err) reject("file writing");

                resolve();
            });

        });
    })
}
