var vlcControl = require('vlc-control-node');
var io = require('socket.io')(http);
var started = false;

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('conectado', function() {

	});

	socket.on('cfg', function(msg) {
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
			socket.emit('error', 'You have to initialize the VlcControl module with the event "cfg"!');
		}
	});
	
	function parseCommand(msg) {
		switch(msg.command) {
		case 'addAndStart':
			if (msg.params.noaudio) {
				socket.emit('sucess', vlcControl.addAndStart(msg.params.uri, true, false));
			} else if (msg.params.novideo) {
				socket.emit('sucess', vlcControl.addAndStart(msg.params.uri, false, true));
			} else {
				socket.emit('sucess', vlcControl.addAndStart(msg.params.uri));
			}
			break;
		case 'addToPlaylist':
			socket.emit('sucess', vlcControl.addToPlaylist(msg.params.uri));
			break;
		case 'play':
			if ((msg.params.id) && (msg.params.id > 0)) {
				socket.emit('sucess', vlcControl.play(msg.params.id));
			} else {
				socket.emit('sucess', vlcControl.play());
			}
			break;
		case 'pause':
			if ((msg.params.id) && (msg.params.id > 0)) {
				socket.emit('sucess', vlcControl.pause(msg.params.id));
			} else {
				socket.emit('sucess', vlcControl.pause());
			}
			break;
		case 'forceResume':
			socket.emit('sucess', vlcControl.forceResume());
			break;
		case 'forcePause':
			socket.emit('sucess', vlcControl.forcePause());
			break;
		case 'stop':
			socket.emit('sucess', vlcControl.stop());
			break;
		case 'next':
			socket.emit('sucess', vlcControl.next());
			break;
		case 'previous':
			socket.emit('sucess', vlcControl.previous());
			break;
		case 'delete':
			if ((msg.params.id) && (msg.params.id > 0)) {
				socket.emit('sucess', vlcControl.delete(msg.params.id));
			}
			break;
		default:
			socket.emit('error', 'Command not recognized!');
		}
	};

});

