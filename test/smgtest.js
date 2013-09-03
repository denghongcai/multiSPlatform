/**
 * Author: dhc
 */

var net = require('net');
var smg = require('../model/smg');
var Pool = require('generic-pool');

var pool = Pool.Pool({
    name: 'socket',
    max: 10,
    create: function (callback) {
        var client = net.connect({
            host: "127.0.0.1",
            port: 9000
        }, function(){
            callback(0, client);
        });
    },
    destroy: function (connection) {
        connection.end();
    },
    log: false
});


var server = net.createServer(function (c) { //'connection' listener
    console.log('server connected');
    c.on('end', function () {
        console.log('server disconnected');
    });
    c.on('data', function (data) {
        console.log('DATA: ' + data);
        pool.acquire(function(err, client){
            if(err){
                console.log(err);
            }
            else{
                client.write("OK");
                pool.release(client);
            }
        });
    });
});
server.listen(8181, function () { //'listening' listener
    console.log('server bound');
});

/*
 var i;
 var arr = new Array();
 for(i=0;i<10000;i++){
 arr.push(i);
 }

 smg.CMPP(arr);

 */