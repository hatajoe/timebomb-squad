/**
 * 'uptime' command parser
 */

exports.parse = function(data) {

    var elem = data.split(/\s+/);

    return {
        time: elem[1],
        avg1: elem[10].slice(0, -1),
        avg2: elem[11].slice(0, -1),
        avg3: elem[12]
    };
};
