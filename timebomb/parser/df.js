/**
 * 'df' command parser
 */

exports.parse = function(data) {

    var lines = data.split('\n');

    var buf = undefined;
    var res = new Array();
    lines.forEach(function (line) {

        if (line === '') {
            return;
        }

        var elem = line.split(/\s+/);

        if (elem[0] === 'Filesystem') {
            return;
        }

        if (elem[0] && !elem[1]) {
            buf = elem[0];
            return;
        }

        if (buf) {
            elem[0] = buf;
            buf = undefined;
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
