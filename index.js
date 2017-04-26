var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    shjs = require('shelljs'),
    app = express(),
    exec = require('sync-exec'),
    config = {
        repoFolder: "repo",
        server: {
            ip: "127.0.0.1",
            port: "3500"
        },
        site: {
            dist: "_data/comments/"
        },
        git: {
            token: "",
            username: "alancampora",
            email: "alan.campora@gmail.com",
            repo: "quilombodrivdev/quilombodrivdev.github.io.git",
            repoName: "quilombodrivdev.github.io",
            branch: "comments",
            remote: "blog",
            commitMessage: "New comment - medusa integration"
        }
    };

app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(config.server.port, config.server.ip, function() {
    console.log('server listening on:', config.server.port, config.server.ip)
    getToken()
        .then(function(data) {
            config.git.token = data
            clone()
        })
});

function clone() {
    shjs.cd('./repo');
    execPromise('cd', config.git.repoName)
        .then(function(data) {
            shjs.echo('repo is alredy cloned')
        })
        .catch(function(error) {
            shjs.echo('cloning repo')
            return execPromise('git', 'clone https://' + config.git.username + ':' + config.git.token + '@github.com/' + config.git.repo)
        })
}

function execPromise(command, props) {
    return new Promise(function(resolve, reject) {
        shjs.exec(command + ' ' + props, function(code, out, err) {
            if (code === 1) reject(err)
            resolve(out);
        })
    })
}

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
        .then(function() {
            this._git(distFile);
        }.bind(this))
        .then(function() {
            res.json({
                "success": "success"
            });

        })
        .catch(function(err) {
            res.json({
                "error": err
            });
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
};

git = function(file) {
    this._getToken()
        .then(function(token) {
            console.log('this is the tokeeen:', token);
            return this._submitPullRequest(file, token);
        });

};

getToken = function() {
    return new Promise(function(resolve, reject) {
        fs.readFile(".gittoken", 'utf8', function(err, data) {
            if (err) reject(err);
            resolve(data.replace(/(?:\r\n|\r|\n)/g, ''));
        })
    });
}
_submitPullRequest = function(file, token) {
    return new Promise(function(resolve, reject) {

        console.log('this is a file', file);
        var gitOrigin = "https://" + config.git.username + ":" + token + "@github.com/" + config.git.repo;

        exec('git config user.name ' + config.git.username);
        exec('git config user.email ' + config.git.email);
        exec('git remote add ' + config.git.remote + ' ' + gitOrigin);
        exec('git pull ' + config.git.remote + ' ' + config.git.branch);
        exec('git checkout ' + config.git.branch);
        exec('git add ' + file);
        exec('git commit -m  "' + config.git.commitMessage + '"');
        exec('git push --quiet  ' + config.git.remote + ' ' + config.git.branch);

        //console.log('pull request');
        res('pull request success');
    })
}
