var oracle = require("oracle");

var connectData = {
    tns: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))',
    user: "hengzhou",
    password: "hengzhouxintong"
};

oracle.connect(connectData, function (err, connection) {
    if (err)
        console.log(err);
    else {
        connection.execute('SELECT * FROM "mt" WHERE rownum < 1000', [], function (err, results) {
            if (err)
                console.log(err);
            else {
                console.log(results);
                connection.close();
            }
        });
    }
});

