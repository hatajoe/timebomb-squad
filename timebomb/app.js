
var util = require('util'),
    fs   = require('fs');

var config = JSON.parse(fs.readFileSync('./config.json'));
if (config === undefined) {
    throw 'failed to parse ./config.json';
}

var url = config.server || 'localhost:3000';
var interval = config.interval || 1000;

var async  = require('async'),
    exec   = require('child_process').exec,
    os     = require('os'),
    client = require('socket.io-client'),
    socket = client.connect(url);


var PREV_CPU_USAGE;
var timer;

process.on('uncaughtException', function (err) {
    console.log('uncaughtException => ' + err);
});

socket.on('connect', function (){

    console.log('connect ' + url);
    console.log('check interval ' + interval);

    timer = setInterval(function () {

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
                var netstat = exec('netstat -an | wc -l', []);

                netstat.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'netstat',
                        data: parser.parse(data)
                    });
                });

                netstat.stderr.on('data', function(data) {
                    console.log('netstat stderr: ' + data);
                });

                netstat.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('netstat process exited with code ' + code);
                    }
                });

            }], function(err, results) {

                var res = {
                    host  : os.hostname(),
                    result: results
                };
                var serialized = JSON.stringify(res);

                socket.send(serialized);
            });

    }, interval);

});

socket.on('disconnect', function () {

    console.log('disconnect ' + url);

    clearInterval(timer);
    socket.disconnect();

    // reconnect
    socket = client.connect(url);
});

