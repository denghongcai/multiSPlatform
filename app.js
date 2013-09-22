var Config = require("./config");
var Pool = require("./pool");
var Smg = require("./model/smg");
var Callbackserver = require('./model/callbackserver');
var Mysqlproxy = require('./model/mysqlproxy');
var Webservice = require('./model/webservice');
var Utf8 = require('utf8');

var pool = new Pool();

var smsInsert = function (rows, content) {
    console.log(rows);
    console.log(content);
    content = Utf8.encode(content.trim());
    var csid;
    var sql = "INSERT ALL";
    for (var item in rows) {
        csid = rows[item]['csid'];
        sql += ' INTO "mt" VALUES(' + rows[item]['sid'] + ', ' + rows[item]['uid'] + ', 4, ' + rows[item]['snumber'] + ', 0, ' + rows[item]['type'] + ', ' + rows[item]['csid'] + ') ';
    }
    sql = sql + 'SELECT * FROM dual';
    console.log(sql);
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err + 'smsinsert');
        else {
            connection.execute(sql,
                [], function (err, results) {
                    if (err)
                        console.log(err + 'smsinsert');
                    else {
                        pool.release(connection);
                    }
                });
        }
    });
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err + 'smsinsert');
        else {
            console.log('INSERT INTO "msgtext" VALUES(' + csid + ', ' + "'" + content + "'" + ')');
            connection.execute('INSERT INTO "msgtext" VALUES(' + csid + ', ' + "'" + content + "'" + ')',
                [], function (err, results) {
                    if (err)
                        console.log(err + 'smsinsert');
                    else {
                        pool.release(connection);
                    }
                });
        }
    });
}

var smsScan = function (callback) {
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err);
        else {
            connection.execute('SELECT * FROM "mt","msgtext" WHERE rownum < 100 AND "flag"=4 AND "mt"."msgsid" = "msgtext"."msgsid" ORDER BY "mt"."msgid"',
                [], function (err, results) {
                    if (err)
                        console.log(err + 'haha');
                    else {
                        pool.release(connection);
                        if (results.length > 0) {
                            callback(5, results, smsRouter);
                        }
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

var smsReport = function (resp, status) {
    var tmp;
    console.log(resp);
    for (var key in resp) {
        tmp = resp[key].split('#');
        pool.acquire(function (err, connection) {
            if (err)
                console.log(err);
            else {
                connection.execute('UPDATE "mt" SET "flag" = ' + (parseInt(tmp[2]) + 3) + ' WHERE ' +
                    '"pnumber" =' + tmp[1] + ' AND "flag" < ' + (parseInt(tmp[2]) + 3 +' limit 1'), [], function (err, updateresults) {
                    if (err)
                        console.log(err);
                    else {
                        pool.release(connection);
                        console.log(updateresults);
                    }
                });
            }
        });
    }
};

var smsRouter = function (results) {
    var smsForCMPP = {
        content: '',
        gatetype: '1',
        number: []
    };
    var smsForSGIP = {
        content: '',
        gatetype: '0',
        number: []
    };
    var smsForSMGP = {
        content: '',
        gatetype: '2',
        number: []
    };
    var content = '';
    for (var key in results) {
        if (content == '')
            ;
        else {
            if (results[key].content != content) {
                if (smsForCMPP.number.length != 0) {
                    Webservice.sendMsg(smsForCMPP);
                }
                if (smsForSGIP.number.length != 0) {
                    Webservice.sendMsg(smsForSGIP);
                }
                if (smsForSMGP.number.length != 0) {
                    Webservice.sendMsg(smsForSMGP);
                }
                smsForCMPP.content = '';
                smsForCMPP.number = [];
                smsForSGIP.content = '';
                smsForSGIP.number = [];
                smsForSGIP.content = '';
                smsForSGIP.number = [];
            }
        }
        switch (results[key].idc) {
            case 1:
                smsForCMPP.number.push(results[key].pnumber);
                break;
            case 2:
                smsForSGIP.number.push(results[key].pnumber);
                break;
            case 3:
                smsForSMGP.number.push(results[key].pnumber);
                break;
        }
        content = results[key].content;
        smsForCMPP.content = content;
        smsForSGIP.content = content;
        smsForSMGP.content = content;
    }
    if (smsForCMPP.number.length != 0) {
        Webservice.sendMsg(smsForCMPP);
    }
    if (smsForSGIP.number.length != 0) {
        Webservice.sendMsg(smsForSGIP);
    }
    if (smsForSMGP.number.length != 0) {
        Webservice.sendMsg(smsForSMGP);
    }
};

var oracleData = function(callback){
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err);
        else {
            connection.execute('SELECT "msgid","flag" FROM "mt" WHERE "flag" =6 OR "flag" = 7', [], function (err, results) {
                if (err)
                    console.log(err);
                else {
                    pool.release(connection);
	            console.log(results);
                    for(var key in results){
                        callback(results[key]['msgid'], results[key]['flag']);
                    }
                    pool.acquire(function (err, connection) {
                        if (err)
                            console.log(err);
                        else {
                            connection.execute('UPDATE "mt" SET "flag"=8 WHERE "flag" =6', [], function (err, results) {
                                if (err)
                                    console.log(err);
                                else {
                                    pool.release(connection);
                                    pool.acquire(function (err, connection) {
                                        if (err)
                                            console.log(err);
                                        else {
                                            connection.execute('UPDATE "mt" SET "flag"=9 WHERE "flag" =7', [], function (err, results) {
                                                if (err)
                                                    console.log(err);
                                                else {
                                                    pool.release(connection);
                                                }
                                            })
                                        }
                                    })
                                }
                            });
                        }
                    })
                }
            });
        }
    });
}

var scanMakeTaskMysql = setInterval(Mysqlproxy.makeSMSTask, Config.config.scanDelay - 5000, smsInsert);

var scanTaskOracle = setInterval(smsScan, Config.config.scanDelay, smsFlag);

//var callbackServer = new Callbackserver(smsReport);
var callbackTask = setInterval(Webservice.getServerCallback, Config.config.scanDelay + 10000, null, smsReport);

var dbsyncTask = setInterval(oracleData, Config.config.scanDelay + 10000, Mysqlproxy.dbSync);

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


//全局错误处理
process.on('uncaughtException', function (err) {
    console.error(err);
});

