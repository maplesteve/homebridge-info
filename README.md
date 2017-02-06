# homebridge-info
Plugin for [homebridge](https://github.com/nfarina/homebridge/) providing stats about the running instance.

homebridge-info acts as a server, that emits several infos about the homebridge instance. You can subscribe and display these in the browser frontend.

Features:
- Memory usage
- Uptime
- OS info
- update check for homebridge version

## Installation
As usual, plugins for homebridge are installed with `npm`:

    npm install -g homebridge-info

## Configuration
Open the `config.json` file located in your homebridge directory in your favorite text editor.
In the `platforms` section, add info to the array:

    {
        "platform": "Info",
        "port": 9876,
        "name": "Homebridge Info Server",
        "updateFrequency": 10000,
        "updateCheckFrequency": 86400
    }

**The config options are**
- **port** (number): The port homebridge-info listens for requests. The default should work fine. If there's a different service in your network, that uses this port, just enter a unused port number here. Default: 9876

- **name** (string): Choose any arbitrary name for this plugin. Default: "Homebridge Info Server"

- **updateFrequency** (number): The plugin will emit updates every n milliseconds, e.g.
    - n = 10000 - every 10 seconds
    - n = 60000 - every minute
    - n = 300000 - every 5 minutes

    Don't set this too low. Default is 10000.

- **updateCheckFrequency** (number): The plugin will check for if an updated version of homebridge is available every n milliseconds, e.g.
    - n = 3600000 - once every hour
    - n = 86400000 - once a day

    Don't set this too low. Default is 3600000.


## Usage
homebridge-info acts as an EventSource which can be subscribed under `/api/info`:

    var eventSource = new EventSource('http://ip:port/api/info');

where `ip` is the IP address of your homebridge server and `port` is the port configured for hombridge-info.

To receive events, add a listener to `eventSource`:

    eventSource.addEventListener('message', function(e) {
        var result = JSON.parse(e.data);
        console.log("got message: " + JSON.stringify(result));
    }, false);

`result` is a JSON object with two properties:
- `type`: either `bridgeInfo` or `bridgeUpdateAvailable`
- `data`:
    - for `type === "bridgeInfo"`:
        - `uptime` - uptime of the homebridge process
        - `heap` - heap memory used by the homebridge process
        - `osInfo` - info about the host
        - `hbVersion` - The version of the hombridge instance
    - for `type === "bridgeUpdateAvailable"`:
        - `updateAvailable`
            - `true`, if the installed version of homebridge is older than the latest release
            - `false`, if not
            - `"unknown"`, if either the running or latest version could not be determined
        - `latestVersion` - either `"unknown"` or the version number of the latest homebridge release

See `test.html` for an example browser client.

## Changes
### v1.0.0
- first Release

## Credit
This plugin uses the API provided by [npms.io](https://npms.io) to check for the latest homebridge version. Therefore, only homebridge versions available on [npmjs.com](https://www.npmjs.com) will be reported.
