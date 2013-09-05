var mysql = require('mysql');
var pool = mysql.createPool({
    socketPath: '/data/mysql/mysql.sock',
    user: 'sms',
    password: 'sms'
});

exports.makeSMSTask = function (callback) {
    pool.getConnection(function (err, connection) {
        connection.query('USE sms', function () {
            connection.query('SELECT * FROM mtcontent WHERE flag = 1 LIMIT 300', function (err, rows) {
                // And done with the connection.
                if (rows.length > 0) {
                    for (var item in rows) {
			console.log(rows[item]);
                        var csid = rows[item]['csid'];
                        var content = rows[item]['content'];
                        connection.query('UPDATE mtcontent SET flag=4 WHERE csid=' + csid, function () {
                            connection.query('SELECT * FROM smsmt WHERE csid=' + csid, function (err, otrows) {
                                connection.query('UPDATE smsmt SET flag=4 WHERE csid=' + csid, function () {
                                    callback(otrows, content);
                                    connection.release();
                                });
                            });
                        });
                    }
                }
                else {
                    connection.release();
                }
            });
        });
    });
}

exports.dbSync = function (sid, flag) {
    console.log(sid+'dbsync'+flag);
    pool.getConnection(function (err, connection) {
        connection.query('USE sms', function () {
            connection.query('UPDATE smsmt SET flag=' + flag + ' WHERE sid=' + sid, function () {
                connection.release();
            });
        })
    });
}
