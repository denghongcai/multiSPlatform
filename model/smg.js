/**
 * Author: dhc
 */

var net = require("net");
var config = require("./config");

exports.CMPP = function(sms){
    var client = new net.Socket();
    client.connect(config.CMPP, function(){
        console.log('CONNECTED TO: ' + config.CMPP.host + ':' + config.CMPP.port);
        for(var key in sms) {
            client.write(key+"\n");
        }
        client.write("end\n");
        client.destroy();
    });
};