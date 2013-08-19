/**
 * Author: dhc
 */

var Oracle = require("oracle");
var Config = require("../config");
var Generic_pool = require("generic-pool");

var connInfo;

switch (process.env.NODE_ENV) {
    case 'development':
        connInfo = Config.config.connInfo.development;

    case 'production':
        connInfo = Config.config.connInfo.production;

    default:
        connInfo = Config.config.connInfo.development;
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

var modelInsert = function (sql, callback) {
    pool.acquire(function (err, connection) {
        if (err)
            console.log(err);
        else {
            connection.execute(sql, [], function (err, results) {
                if (err)
                    console.log(err);
                else {
                    callback();
                    console.log(results);
                }
                pool.release(connection);
            });
        }
    });
}

num = 0;

var forInsert = function (start, end, step) {
    var i;
    while (true) {
        (function () {
            var sql = "INSERT ALL";
            for (i = start; i < start + step; i++) {
                sql = sql + ' INTO "mt" VALUES(' + i + ',0 ,0, 13545107112,0 ,0) ';
            }
            sql = sql + 'SELECT * FROM dual';
            modelInsert(sql, function () {
                console.log(num++);
            });
        })();
        start = start + step;
        if (start + step > end) {
            step = end - start;
        }
        if (start == end) {
            break;
        }
    }
}

forInsert(0, 5000, 300);