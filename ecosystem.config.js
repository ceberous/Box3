module.exports = {
	apps : [
		{
			name   : "MediaBrowser" ,
			script : "./main.js" ,
			watch: true ,
			ignore_watch : [ ".git" , "node_modules" , "config" , "client/js/webSocketServerAddress.js" ] ,
			watch_options: {
				followSymlinks: false
			} ,
			max_restarts: 10 ,
		}
	] ,
}
