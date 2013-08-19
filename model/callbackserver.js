/**
 * Author: dhc
 */

var Net = require('net');
var Config = require('../config');

var callbackArray = new Array();

module.exports = function(callback){
    var localserver = Net.createServer(function (c) { //'connection' listener
        console.log('server connected');
        c.on('end', function () {
            console.log('server disconnected');
        });
        c.on('data', function(data){
            console.log('DATA: '+data);
        });
    });
    localserver.listen(Config.config.callbackPort, function () {
        console.log('Callback server listen on '+Config.config.callbackPort);
    });
};