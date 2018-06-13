var wSpawn = require("child_process").spawn;
//var cp = wSpawn("firefox");
var cp = wSpawn("tryFirefoxRemoteDisplayLauncher");
cp.unref();
process.exit(0);