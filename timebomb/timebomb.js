/**
 * timebomb.js
 */

var fs = require('fs');
var config;
fs.readFile('./config.json', function (err, data) {

    if (err) {
        throw err;
    }

    var str = data.toString('utf8');
    config = JSON.parse(str);
});


var url = config.server || 'localhost:3000';
var interval = config.interval || 1000;

var util   = require('util'),
    async  = require('async'),
    spawn  = require('child_process').spawn,
    exec   = require('child_process').exec,
    client = require('socket.io-client'),
    os     = require('os'),
    socket = client.connect(url);


var PREV_CPU_USAGE;

socket.on('connect', function (){

    console.log('connect ' + url);

    socket.on('disconnect', function () {

        console.log('disconnect ' + url);

        socket.disconnect();
        process.exit(0);
    });

    setInterval(function () {

        async.parallel([

            /**
             * uptime
             */
            function(callback) {

                var parser = require('./parser/uptime.js');
                var uptime = exec('uptime', []);

                uptime.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'uptime',
                        data: parser.parse(data)
                    });
                });

                uptime.stderr.on('data', function(data) {
                    console.log('uptime stderr: ' + data);
                    callback(null, {
                        name: 'uptime',
                        data: data
                    });
                });

                uptime.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('uptime process exited with code ' + code);
                    }
                });
            },
            /**
             * cat /proc/stat
             */
            function(callback) {

                var parser = require('./parser/proc_stat.js');
                var cat = exec('cat /proc/stat', []);

                cat.stdout.on('data', function(data) {

                    if (undefined === PREV_CPU_USAGE) {
                        PREV_CPU_USAGE = data;
                    }

                    callback(null, {
                        name: 'cpu',
                        data: parser.parse(data, PREV_CPU_USAGE)
                    });

                    PREV_CPU_USAGE = data;
                });

                cat.stderr.on('data', function(data) {
                    console.log('cat /proc/stat stderr: ' + data);
                    callback(null, {
                        name: 'cpu',
                        data: data
                    });
                });

                cat.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('cat /proc/stat process exited with code ' + code);
                    }
                });
            },
            /**
             * free
             */
            function(callback) {

                var parser = require('./parser/free.js');
                var free = exec('free', []);

                free.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'free',
                        data: parser.parse(data)
                    });
                });

                free.stderr.on('data', function(data) {
                    console.log('free stderr: ' + data);
                    callback(null, {
                        name: 'free',
                        data: data
                    });
                });

                free.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('free process exited with code ' + code);
                    }
                });
            },
            /**
             * df
             */
            function(callback) {

                var parser = require('./parser/df.js');
                var df = exec('df', []);

                df.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'df',
                        data: parser.parse(data)
                    });
                });

                df.stderr.on('data', function(data) {
                    console.log('df stderr: ' + data);
                    callback(null, {
                        name: 'df',
                        data: data
                    });
                });

                df.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('df process exited with code ' + code);
                    }
                });
            },
            /**
             * netstat & wc
             */
            function(callback) {

                var parser = require('./parser/netstat.js');
                var netstat = exec('netstat', ['an']),
                    wc      = exec('wc'     , ['-l']);

                netstat.stdout.on('data', function(data) {
                    wc.stdin.write(data);
                });

                netstat.stderr.on('data', function(data) {
                    console.log('netstat stderr: ' + data);
                });

                netstat.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('netstat process exited with code ' + code);
                    }
                    wc.stdin.end();
                });

                wc.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'netstat',
                        data: parser.parse(data)
                    });
                });

                wc.stderr.on('data', function(data) {
                    console.log('wc stderr: ' + data);
                    callback(null, {
                        name: 'netstat',
                        data: data
                    });
                });

                wc.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('wc process exited with code ' + code);
                    }
                });
            }], function(err, results) {

                var res = {
                    host  : os.hostname(),
                    result: results
                };
                var serialized = JSON.stringify(res);
                // console.log(serialized);
                socket.send(serialized);
            });

    }, interval);

});
