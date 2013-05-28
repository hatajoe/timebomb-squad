/**
 * 'nestat' command parser
 */

exports.parse = function(data) {

    var elem = data.split(/\s+/);

    return {
        connections: elem[0]
    };
};
