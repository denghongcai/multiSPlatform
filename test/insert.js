/**
 * Author: dhc
 */

var oracle = require("oracle");

var connectData = {
    tns: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))',
    user: "hengzhou",
    password: "hengzhouxintong"
};

var modelInsert = function (sql, id, callback) {
    console.log(id);
    oracle.connect(connectData, function (err, connection) {
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
                connection.close();
            });
        }
    });
}

num = 0;

var forInsert = function (t) {
    var i = t;
    var j = t + 300;
    var sql = "INSERT ALL";
    for (; i < j; i++) {
        sql = sql + ' INTO "mt" VALUES(' + i + ',0 ,0, 13545107112,0 ,0) ';
    }
    sql = sql + 'SELECT * FROM dual';
    modelInsert(sql, t, function () {
        console.log(num++);
    });
}

var i;

for (i = 0; i < 79700; i += 300) {
    forInsert(i);
}
