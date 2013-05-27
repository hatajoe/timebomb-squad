/**
 * 'df' command parser
 */

exports.parse = function(data) {

    var lines = data.split('\n');

    var res = new Array();
    lines.forEach(function (line) {

        var elem = line.split(/\s+/);

        if (elem[0] === 'Filesystem' || elem[0] === '') {
            return;
        }

        res.push({
            dev: elem[0],
            total: elem[1],
            used: elem[2],
            available: elem[3],
            use: elem[4],
            mount: elem[5]
        });
    });

    return res;
};
