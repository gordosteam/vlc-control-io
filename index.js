var http = require('http').Server();
var vlcControl = require('vlc-control-node');
var io = require('socket.io')(http);
var started = false;
var net = require('net');
var pathImgs = '';

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.emit('conectado', 'hello');

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('conectado', function() {

	});

	socket.on('cfg', function(msg) {
		pathImgs = msg.pathImgs;
		vlcControl.init({
			ip : msg.ip,
			port : msg.port,
			user : msg.user,
			password : msg.password
		});
		started = true;
	});

	socket.on('command', function(msg) {
		if (started) {
			parseCommand(msg);
		} else {
			socket.emit('fault', 'You have to initialize the VlcControl module with the event "cfg"!');
		}
	});
	
	var server = net.createServer(function(c) {//'connection' listener
	c.on("error", function(err) {

	});
	c.on('end', function() {
		console.log('Client Disconnected');
	});

	c.on('data', function(data) {
		try {
			var obj = JSON.parse(data.toString());
		} catch(err) {
			var obj = null;
		};
		

		if ((obj) && (obj.information) && (obj.information.category) && (obj.information.category.meta) && (obj.information.category.meta.artwork_url)) {
			// console.log(obj.information.category.meta.artwork_url);
			var file = obj.information.category.meta.artwork_url.substring(8);
			// console.log(obj.information.category.meta.artwork_url.substring(8));
			file = file.replace(/\//g, '\\');
			file = file.replace(/%20/g, ' ');
			var newFile = pathImgs;
			//console.log(file);
			//console.log(newFile);
			if (file) {
				var startIndex = (file.indexOf('\\') >= 0 ? file.lastIndexOf('\\') : file.lastIndexOf('/'));
				var filename = file.substring(startIndex);
				if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
					filename = filename.substring(1);
				}
			}
			obj.information.category.meta.artwork_url = '../imgs/' + filename;
			require('child_process').exec('xcopy "' + file + '" ' + newFile + ' /hqyi', function() {
				socket.broadcast.emit('sucess', JSON.stringify(obj));
			});

		} else if (obj) {
			socket.broadcast.emit('sucess', JSON.stringify(obj));
		}

	});
});

try {
	server.listen(8124, function() {//'listening' listener

	});
	server.on('error', function(e) {
		//console.log(e);
	});

} catch (err) {
	console.log(err);

};

	function parseCommand(msg) {
		switch(msg.command) {
		case 'addAndStart':
			if ((msg.params) && (msg.params.noaudio)) {
				vlcControl.addAndStart(msg.params.uri, true, false);
			} else if ((msg.params) && (msg.params.novideo)) {
				vlcControl.addAndStart(msg.params.uri, false, true);
			} else {
				vlcControl.addAndStart(msg.params.uri);
			}
			break;
		case 'addToPlaylist':
			vlcControl.addToPlaylist(msg.params.uri);
			break;
		case 'play':

			if ((msg.params) && (msg.params.id) && (msg.params.id > 0)) {
				vlcControl.play(msg.params.id);
			} else {
				vlcControl.play();
				//socket.emit('sucess', vlcControl.play());
			}
			break;
		case 'pause':
			if ((msg.params) && (msg.params.id) && (msg.params.id > 0)) {
				vlcControl.pause(msg.params.id);
			} else {
				vlcControl.pause();
			}
			break;
		case 'forceResume':
			vlcControl.forceResume();
			break;
		case 'forcePause':
			vlcControl.forcePause();
			break;
		case 'stop':
			vlcControl.stop();
			break;
		case 'next':
			vlcControl.next();
			break;
		case 'previous':
			vlcControl.previous();
			break;
		case 'delete':
			if ((msg.params) && (msg.params.id) && (msg.params.id > 0)) {
				vlcControl.delete(msg.params.id);
			}
			break;
		default:
			socket.emit('fault', 'Command not recognized!');
		}
	};

});



http.listen(3500, function() {
	console.log('listening on *:3500');
});

