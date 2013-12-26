/**
 * Model
 */
var Server = Backbone.Model.extend({
    defaults: {
        "host": '',
        "uptime": 0,
        "cpu": 0,
        "free": 0,
        "df": 0,
        "netstat": 0,
        "is_first": 0
    },
    initialize: function() {
    }
});

var Servers = Backbone.Collection.extend({
    model: Server
});

/**
 * View
 */
var ServerView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, "render", "remove");

        this.model.bind("change", this.render);
        this.model.bind("destroy", this.remove);
    },
    render: function () {
        var template;
        var target_tag;
        if (this.model.get('is_first') === 1) {
            $("#message").append(_.template($("#server-tmpl-with-wrapper").text(), this.model.attributes));
        } else {
            $("#" + this.model.get('host')).html(_.template($("#server-tmpl").text(), this.model.attributes));
        }
        return this;
    },
    remove: function () {
        $(this.el).remove();
        return this;
    }
});

var ServerListView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, "resetItems", "appendItem", "removeItem");

        this.collection.bind("reset", this.resetItems);
        this.collection.bind("add", this.appendItem);
        this.collection.bind("remove", this.removeItem);
    },
    resetItems: function (collection) {
        collection.each(function (model) {
            this.appendItem(model);
        }, this);
    },
    appendItem: function (model) {
        var view = new ServerView({model: model});
        $(this.el).append(view.render().el);
    },
    removeItem: function (model) {
        model.destroy();
    }
});

var servers = new Servers();
var serverListView = new ServerListView({collection: servers});

(function() {

    var socket = io.connect(location.href);

    socket.on('message', function(message){

        var json = jQuery.parseJSON(message);

        var tmpServer,
            uptime,
            cpu,
            free,
            df,
            netstat,
            host = json.host;

        console.log(json.host);

        jQuery.each(json.result, function(key, res) {

            if (res.name === 'uptime') {
                uptime = res.data;
            } else if (res.name === 'cpu') {
                cpu = res.data;
            } else if (res.name === 'free') {
                free = res.data;
            } else if (res.name === 'df') {
                df = res.data;
            } else if (res.name === 'netstat') {
                netstat = res.data;
            }
        });

        tmpServer = servers.find(function (server) {
            return server.get('host') === host;
        });
        if (tmpServer) {

            free.per = (free.mem.used / free.mem.total) * 100;

            tmpServer.set({
                uptime: uptime,
                cpu: cpu,
                free: free,
                df: df,
                netstat: netstat,
                is_first: 0
            });

        } else {

            free.per = (free.mem.used / free.mem.total) * 100;

            servers.add(new Server({
                host: host,
                uptime: uptime,
                cpu: cpu,
                free: free,
                df: df,
                netstat: netstat,
                is_first: 1
            }));
        }
    });

}());
