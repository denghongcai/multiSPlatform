/**
 * Author: dhc
 */

var soap = require('soap');
var parseString = require('xml2js').parseString;
var url = 'http://192.168.2.18:8000/sxt/services/SxtServiceFacede?wsdl';
var auth = {
    name: 'x070',
    pwd: 'xf123456'
}

exports.sendMsg = function (data) {
    soap.createClient(url, {endpoint: "http://192.168.2.18:8000/sxt/services/SxtServiceFacede"}, function (err, client) {
        if (err)
            console.log(err);
        else {
            client.sendMsg({
                msg: {
                    protocol: {
                        name: auth.name,
                        pwd: auth.pwd,
                        type: 2,
                        count: data['number'].length,
                        content: data['content'],
                        gateType: data['gatetype'],
                        termini: {
                            number: data['number']
                        }
                    }
                }
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    console.log(client.lastRequest);
                }
                else{
                    console.log(result);
		    console.log(client.lastRequest);
		}
            })
        }
    });
}

exports.getServerCallback = function (MOcallback, REPORTcallback) {
    soap.createClient(url, {endpoint: "http://192.168.2.18:8000/sxt/services/SxtServiceFacede"}, function (err, client) {
        if (err)
            console.log(err);
        else {
            /*
            client.getMo({
                msg: {
                    protocol: {
                        name: auth.name,
                        pwd: auth.pwd
                    }
                }
            }, function (err, result) {
                if (err) {
                    console.log(err);
                }
                else
                    parseString(result['getMoReturn'], function (err, result) {
                        console.log(result.msg.protocol[0]);
                    });
            });
            */
            client.getReport({
                msg: {
                    protocol: {
                        name: auth.name,
                        pwd: auth.pwd
                    }
                }
            }, function (err, result) {
                if (err) {
                    console.log(err);
                }
                else
                    parseString(result['getReportReturn'], function (err, result) {
                        console.log(result.msg.protocol[0]);
                        if(result.msg.protocol[0].code[0] == '0'){
                            REPORTcallback(result.msg.protocol[0].termini[0]['resp'], null);
                        }
                    });
            })
        }
    });
}
