var wSpawn = require("child_process").spawn;
var cp = wSpawn("firefox");
cp.unref();
process.exit(0);