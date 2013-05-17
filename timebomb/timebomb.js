/**
 * timebomb.js
 */
var url = 'http://localhost:3000';
var client = require('socket.io-client'),
    socket = client.connect(url);

console.log('connect ' + url);

socket.on('connect', function (){

    console.log('connect ' + url);

    socket.on('disconnect', function () {

        console.log('disconnect ' + url);

        socket.disconnect();
        process.exit(0);
    });

    setInterval(function () {

        var spawn   = require('child_process').spawn,
            exec    = require('child_process').exec,
            uptime  = exec('uptime' , []),
            w       = exec('w'      , []),
            free    = exec('free'   , []),
            df      = exec('df'     , []),
            netstat = spawn('netstat', ['an']),
            wc      = spawn('wc'   , ['-l']);

        /**
         * uptime
         */
        uptime.stdout.on('data', function(data) {
            socket.send(data);
        });

        uptime.stderr.on('data', function(data) {
            console.log('uptime stderr: ' + data);
        });
        
        uptime.on('exit', function(code) {
            if (code !== 0) {
                console.log('uptime process exited with code ' + code);
            }
        });

        /**
         * w
         */
        w.stdout.on('data', function(data) {
            socket.send(data);
        });

        w.stderr.on('data', function(data) {
            console.log('w stderr: ' + data);
        });
        
        w.on('exit', function(code) {
            if (code !== 0) {
                console.log('w process exited with code ' + code);
            }
        });

        /**
         * free
         */
        free.stdout.on('data', function(data) {
            socket.send(data);
        });

        free.stderr.on('data', function(data) {
            console.log('free stderr: ' + data);
        });
        
        free.on('exit', function(code) {
            if (code !== 0) {
                console.log('free process exited with code ' + code);
            }
        });

        /**
         * df
         */
        df.stdout.on('data', function(data) {
            socket.send(data);
        });

        df.stderr.on('data', function(data) {
            console.log('df stderr: ' + data);
        });
        
        df.on('exit', function(code) {
            if (code !== 0) {
                console.log('df process exited with code ' + code);
            }
        });

        /**
         * netstat
         */
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

        /**
         * wc
         */
        wc.stdout.on('data', function(data) {
            socket.send(data);
        });

        wc.stderr.on('data', function(data) {
            console.log('wc stderr: ' + data);
        });
        
        wc.on('exit', function(code) {
            if (code !== 0) {
                console.log('wc process exited with code ' + code);
            }
        });

    }, 1000);

});
