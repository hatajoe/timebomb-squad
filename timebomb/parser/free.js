/**
 * 'free' command parser
 */

exports.parse = function(data) {

    var elem = data.split('\n');
    var mem = elem[1];
    var cache = elem[2];
    var swap = elem[3];

    mem = mem.split(/\s+/);
    cache = cache.split(/\s+/);
    swap = swap.split(/\s+/);

    return {
        mem: {
            total: mem[1],
            used: mem[2],
            free: mem[3]
        },
        cache: {
            used: cache[2],
            free: cache[3]
        },
        swap: {
            total: swap[1],
            used: swap[2],
            free: swap[3]
        }
    };
};
