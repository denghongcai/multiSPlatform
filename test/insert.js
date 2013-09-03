/**
 * Author: dhc
 */

var Pool = require("../pool");

var pool = new Pool();

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
                sql = sql + ' INTO "mt" VALUES(0, 0, 0, 13545107112, 0, 0, ' + i + ') ';
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