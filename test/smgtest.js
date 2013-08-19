/**
 * Author: dhc
 */

var net = require('net');
var smg = require('../model/smg');

var client = new net.Socket();

var server = net.createServer(function (c) { //'connection' listener
    console.log('server connected');
    c.on('end', function () {
        console.log('server disconnected');
    });
    c.on('data', function (data) {
        console.log('DATA: ' + data);
        if (data.toString().indexOf("end\n") != -1) {
            client.connect({
                host: "127.0.0.1",
                port: 9000
            }, function () {
                client.write("OK");
                client.destroy();
            });
        }
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