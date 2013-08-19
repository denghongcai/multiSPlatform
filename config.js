/**
 * Author: dhc
 */

exports.config = {
    connInfo: {
        development:{
            host: "120.202.19.49",
            port: 1521,
            username: "hengzhou",
            pass: "hengzhouxintong",
            process: 100
        },
        production:{
            host: "localhost",
            port: 1521,
            username: "hengzhou",
            pass: "hengzhouxintong",
            process: 200
        }
    },
    scanDelay: 10000,
    callbackPort: 9000
};