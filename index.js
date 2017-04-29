var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    shjs = require('shelljs'),
    app = express(),
    crypto = require('crypto'),
    config = require('./config.json'),
    recentRequests = {};

init()

function init() {
    config.server.port = process.env.NODE_PORT || 3500;
    config.server.ip = process.env.NODE_IP || '127.0.0.1';
}
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(config.server.port, config.server.ip, function() {
    shjs.echo('server listening on:', config.server.port, config.server.ip)

    getToken()
        .then(function(data) {
            config.git['token'] = data
            clone()
        })
});

app.post('/post/comment', function(req, res, next) {
    if (allowedToRunRequest(req)) {
        postComment(req, res)
    } else {
        res.status(405).send({
            error: "Method Not Allowed"
        });
    }
});

function allowedToRunRequest(req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        previousRequestTime, now,
        commentData = getCommentData(req),
        slug = commentData.slug;

    shjs.echo("IP:", ip)
    shjs.echo("RecentRequests:", recentRequests)

    if (!recentRequests[ip]) {
        recentRequests[ip] = {};
        recentRequests[ip][slug] = new Date()
        return true
    }
    if (!recentRequests[ip][slug]) {
        recentRequests[ip][slug] = new Date()
        return true
    }

    now = new Date()
    previousRequestTime = recentRequests[ip][slug]
    if (secondsOfDifference(now, previousRequestTime) > 120) {
        recentRequests[ip][slug] = now
        return true
    }

    return false

}

function secondsOfDifference(endDate, startDate) {
    return (endDate.getTime() - startDate.getTime()) / 1000;
}

function getCommentData(req) {
    return req.body;
}

function postComment(req, res) {
    var entry = req.body,
        hash = new Date().getTime().toString(),
        distFolder = "./_data/" + entry.slug + "/",
        distFile = distFolder + hash + ".yml",
        data = "";

    for (var key in entry) {
        if (key == 'email') {
            data += key + ":" + " " + getHash(entry[key]) + " \n";
        } else {
            data += key + ":" + " " + entry[key] + " \n";
        }
    }

    shjs.echo('data received:', entry)

    fileCreation(distFolder, distFile, data)
        .then(function() {
            return submitPullRequest(distFile);
        })
        .then(function(data) {
            res.json({
                "success": data
            });

        })
        .catch(function(err) {
            res.json({
                "error": err
            });
        });

}

function clone() {
    execPromise('git', 'clone ' + repoURL())
        .then(function() {
            shjs.echo('config user.email');
            return execPromise('git', 'config user.email ' + config.git.email)
        })
        .then(function() {
            return shjs.cd(config.git.repoName);
        })
        .then(function() {
            shjs.echo('config user.name');
            return execPromise('git', 'config user.name ' + config.git.username)
        })
        .then(function() {
            shjs.echo('repo setup done')
        })
        .catch(function(err) {
            shjs.echo('error:' + err)
            shjs.cd(config.git.repoName)
        })
}

function repoURL() {
    return 'https://' + config.git.username + ':' + config.git.token + '@github.com/' + config.git.repo
}

function execPromise(command, props) {
    return new Promise(function(resolve, reject) {
        shjs.exec(command + ' ' + props, function(code, out, err) {
            if (code > 0) reject(err)
            resolve(out)
        })
    })
}

function getToken() {
    return new Promise(function(resolve, reject) {
        fs.readFile(".gittoken", 'utf8', function(err, data) {
            if (err) reject(err)
            resolve(data.replace(/(?:\r\n|\r|\n)/g, ''))
        })
    });
}

function fileCreation(distFolder, distFile, data) {
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


function submitPullRequest(file) {
    return new Promise(function(resolve, reject) {

        var gitOrigin = repoURL(),
            pull = config.git.remote + ' ' + config.git.branch;

        shjs.exec('pwd')
        shjs.exec('git pull ' + pull);
        shjs.exec('git checkout ' + config.git.branch);
        shjs.exec('git add ' + file);
        shjs.exec('git commit -m  "' + config.git.commitMessage + '"');
        shjs.exec('git push --quiet ' + config.git.remote + ' ' + config.git.branch);

        resolve('pull success');
    })
}

function getHash(field) {
    return crypto
        .createHash('md5')
        .update(field)
        .digest('hex')
}
