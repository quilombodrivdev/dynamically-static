var express = require('express'), 
    bodyParser = require('body-parser')
    app = express(), 
    config = {
        ip: "127.0.0.1", 
        port: "3500" 
    };

app.use(bodyParser.json());

app.listen(config.port,config.ip, function(){
    console.log('server listening on:' , config.port, config.ip);
});

app.post('/post/comment', function(req,res){
    console.log(req.body);
    res.json({data:'success'});
});


