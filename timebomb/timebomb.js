/**
 * timebomb.js
 */
var url = 'http://localhost:3000';
var util   = require('util'),
    async  = require('async'),
    spawn  = require('child_process').spawn,
    exec   = require('child_process').exec,
    client = require('socket.io-client'),
    socket = client.connect(url);

socket.on('connect', function (){

    socket.on('disconnect', function () {

        console.log('disconnect ' + url);

        socket.disconnect();
        process.exit(0);
    });

    setInterval(function () {

        async.parallel([

            /**
             * w
             */
            function(callback) {

                var w = exec('w', []);

                w.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'w',
                        data: data
                    });
                });

                w.stderr.on('data', function(data) {
                    console.log('w stderr: ' + data);
                    callback(null, {
                        name: 'w',
                        data: data
                    });
                });

                w.on('exit', function(code) {
                    if (code !== 0) {
                        console.log('w process exited with code ' + code);
                    }
                });
            },
            /**
             * free
             */
            function(callback) {

                var free = exec('free', []);

                free.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'free',
                        data: data
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

                var df = exec('df', []);

                df.stdout.on('data', function(data) {
                    callback(null, {
                        name: 'df',
                        data: data
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
                        data: data
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

                var serialized = JSON.stringify(results);
                socket.send(serialized);
            });

    }, 1000);

});
