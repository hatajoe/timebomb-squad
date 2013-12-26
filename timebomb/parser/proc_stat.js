/**
 * 'cat /proc/stat' command parser
 */

exports.parse = function(data, prev) {

    var elem = data.split('\n');
    elem = elem[0].split(/\s+/);
    var prev_elem = prev.split('\n');
    prev_elem = prev_elem[0].split(/\s+/);

    var total = parseInt(elem[1]) - parseInt(prev_elem[1])
            + parseInt(elem[2]) - parseInt(prev_elem[2])
            + parseInt(elem[3]) - parseInt(prev_elem[3])
            + parseInt(elem[4]) - parseInt(prev_elem[4]);

    if (total === 0) {
        total = 1;
    }

    var user = (parseInt(elem[1]) - parseInt(prev_elem[1])) * 100 / total;
    user *= 100;
    user = Math.floor(user);
    user /= 100;

    var nice = (parseInt(elem[2]) - parseInt(prev_elem[2])) * 100 / total;
    nice *= 100;
    nice = Math.floor(nice);
    nice /= 100;

    var sys = (parseInt(elem[3]) - parseInt(prev_elem[3])) * 100 / total;
    sys *= 100;
    sys = Math.floor(sys);
    sys /= 100;

    var idle = (parseInt(elem[4]) - parseInt(prev_elem[4])) * 100 / total;
    idle *= 100;
    idle = Math.floor(idle);
    idle /= 100;

    return {
        user: user,
        nice: nice,
        sys:  sys,
        idle: idle
    };
};
