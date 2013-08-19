var Oracle = require("oracle");
var Config = require("./config");
var Generic_pool = require("generic-pool");
var Smg = require("./model/smg");
var Callbackserver = require('./model/callbackserver');

var connInfo;

switch (process.env.NODE_ENV) {
    case 'development':
        connInfo = Config.config.connInfo.development;
        break;

    case 'production':
        connInfo = Config.config.connInfo.production;
        break;

    default:
        connInfo = Config.config.connInfo.development;
        break;
}

var connectData = {
    tns: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=' + connInfo.host +
        ')(PORT=' + connInfo.port + '))(CONNECT_DATA=(SID=ORCL)))',
    user: connInfo.username,
    password: connInfo.pass
};

//oracle连接池
var pool = Generic_pool.Pool({
    name: 'oracle',
    max: connInfo.process,
    create: function (callback) {
        Oracle.connect(connectData, function (err, connection) {
            callback(err, connection);
        });
    },
    destroy: function (connection) {
        connection.close();
    },
    validate: function (connection) {
        return connection.isConnected();
    },
    log: false
});

var callbackServer = new Callbackserver();

var smsScan = function (callback) {
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err);
        else {
            connection.execute('SELECT * FROM "mt" WHERE rownum < 10 AND "flag"=0 ORDER BY "msgid"',
                [], function (err, results) {
                    if (err)
                        console.log(err);
                    else {
                        pool.release(connection);
                        callback(1, results, smsRouter);
                        console.log(results);
                    }
                });
        }
    });
};

var smsFlag = function (flag, results, callback) {

    var info = results[results.length - 1];

    pool.acquire(function (err, connection) {
        if (err)
            console.log(err);
        else {
            connection.execute('UPDATE "mt" SET "flag" = ' + flag + ' WHERE ' +
                '"msgid" <=' + info.msgid + ' AND "flag" = ' + (flag - 1), [], function (err, updateresults) {
                if (err)
                    console.log(err);
                else {
                    pool.release(connection);
                    console.log(updateresults);
                    callback(results);
                }
            });
        }
    });
};

var smsRouter = function (results) {
    var smsForCMPP = new Array();
    var smsForSGIP = new Array();
    var smsForSMGP = new Array();
    for (var key in results) {
        switch (results[key].idc) {
            case 0:
                smsForCMPP.push(results[key]);
                break;
            case 1:
                smsForSGIP.push(results[key]);
                break;
            case 2:
                smsForSMGP.push(results[key]);
                break;
        }
    }
    console.log("length: " + smsForCMPP.length);
    if (smsForCMPP.length != 0) {
        Smg.CMPP(smsForCMPP);
    }
    if (smsForSGIP.length != 0) {
        Smg.CMPP(smsForSGIP);
    }
    if (smsForSMGP.length != 0) {
        Smg.CMPP(smsForSMGP);
    }
};

var scanTask = setInterval(smsScan, Config.config.scanDelay, smsFlag);

//退出事件监听
process.on('SIGINT', function () {
    pool.drain(function () {
        pool.destroyAllNow(function () {
            console.log("multiSPlatform has exit!");
            clearInterval(scanTask);
            process.exit();
        });
    });
});

