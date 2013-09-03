/**
 * Author: dhc
 */

var Config = require("./config");
var Generic_pool = require("generic-pool");
var Oracle = require("oracle");


module.exports = function () {

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
        idleTimeoutMillis : 5000,
        log: false
    });

    return pool;
};