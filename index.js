/* eslint-env node, es6 */

var HomebridgeAPI;

module.exports = function(homebridge) {
    HomebridgeAPI = homebridge;
    homebridge.registerPlatform("homebridge-info", "Info", InfoPlatform);
}

function InfoPlatform(log, config) {

    // Set defaults, if not defined in config.json.
    if (!config.updateCheckFrequency) {
        config.updateCheckFrequency = 10000;
    }
    if (!config.updateFrequency) {
        config.updateFrequency = 5000;
    }


    function handleRequest(req, res) {
        log("handleAPIRequest: " + req.url);
        var path = require('url').parse(req.url).pathname;
        switch (path) {
            case '/api/info':
                infoOut(req, res);
                break;
            default:
                res.statusCode = 404;
                res.end();
        }
    }


    var path = require('path');
    var BridgeInfoEmitter = require(path.resolve(require.resolve('./BridgeInfoEmitter')));
    var infoEmitter = BridgeInfoEmitter(config, HomebridgeAPI);
    infoEmitter.start();

    function infoOut(req, res) {
        res.setHeader("Content-Type", "text/event-stream");

        // Send the current data to the client so he doesn't have to
        // wait for the next update before he get's something.
        res.write("data: " + JSON.stringify({'type': 'bridgeInfo', 'data': infoEmitter.initialInfo()}) + "\n\n");

        // From here we'll write whenever the emitter has something to say...
        infoEmitter.on('bridgeInfo', function(data) {
            res.write("data: " + JSON.stringify({'type': 'bridgeInfo', 'data': data}) + "\n\n");
        });

        infoEmitter.on('bridgeUpdateAvailable', function(data) {
            res.write("data: " + JSON.stringify({'type': 'bridgeUpdateAvailable', 'data': data}) + "\n\n");
        });
    }


    // Launches the webserver and transmits the website by concatenating the precreated markup
    var http = require('http');
    var server = http.createServer(handleRequest);

    server.listen(config.port, function() {
        var os = require('os');
        var ifaces = os.networkInterfaces();

        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }
                log("is listening on: http://%s:%s", iface.address, config.port);
            });
        });
    });
}

InfoPlatform.prototype.accessories = function(callback) {
    this.accessories = [];
    callback(this.accessories);
}
