(function() {

    var socket = io.connect(location.href);

    var clients = new Array();

    socket.on('message', function(message){
        var json = jQuery.parseJSON(message);

        var html = '<h2>HOST: ' + json.host + '</h2>';

        html += '<div class="container-fluid"><div class="row-fluid"><div class="span12"><div class="row-fluid">';

        jQuery.each(json.result, function(key, data) {

            if (data.name === 'uptime') {
                html += '<div class="span2">';
                html += '[' + data.name + ']<br />';
                html += 'uptime : ' + data.data.time  + '<br />';
                html += 'loadavg: ' + data.data.avg1  + '<br />';
                html += 'loadavg: ' + data.data.avg2  + '<br />';
                html += 'loadavg: ' + data.data.avg3  + '<br />';
                html += '</div>';

            } else if (data.name === 'cpu') {
                html += '<div class="span1">';
                html += '[' + data.name + ']<br />';
                html += 'user: ' + data.data.user  + '<br />';
                html += 'nice: ' + data.data.nice  + '<br />';
                html += 'sys : ' + data.data.sys   + '<br />';
                html += 'idle: ' + data.data.idle  + '<br />';
                html += '</div>';

            } else if (data.name === 'free') {
                html += '<div class="span2">';
                html += '[' + data.name + ']<br />';
                html += 'mem total : ' + data.data.mem.total + '<br />';
                html += 'mem used  : ' + data.data.mem.used  + '<br />';
                html += 'mem free  : ' + data.data.mem.free  + '<br />';
                html += 'cache used: ' + data.data.cache.used + '<br />';
                html += 'cache free: ' + data.data.cache.free + '<br />';
                html += 'swap total: ' + data.data.swap.total + '<br />';
                html += 'swap used : ' + data.data.swap.used  + '<br />';
                html += 'swap free : ' + data.data.swap.free  + '<br />';
                html += '</div>';

            } else if (data.name === 'df') {

                jQuery.each(data.data, function (key, elem) {
                    html += '<div class="span2">';
                    html += '[' + data.name + ']<br />';
                    html += '(' + elem.dev + ')<br />';
                    html += 'total     : ' + elem.total     + '<br />';
                    html += 'used      : ' + elem.used      + '<br />';
                    html += 'available : ' + elem.available + '<br />';
                    html += 'use       : ' + elem.use       + '<br />';
                    html += 'mount     : ' + elem.mount     + '<br />';
                    html += '</div>';
                });

            } else if (data.name === 'netstat') {
                html += '<div class="span1">';
                html += '[' + data.name + ']<br />';
                html += 'connections: ' + data.data.connections + '<br />';
                html += '</div>';
            }

        });

        html += '</div></div></div></div>';

        if (clients[json.host]) {

            $('#' + json.host).html(html + '<br>');

        } else {

            html = '<div id="' + json.host + '">' + html + '</div>';
            $("#message").append(html + '<br>');
        }

        clients[json.host] = 1;

    });

    socket.on('disconnect', function(message){
        $("#message").append('disconnected');
    });

}());
