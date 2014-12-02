vlc-control-io
==============

Control your VLC with Node. JS with socket.io + vlc-control-node module

# Setup
First you have to emit an IO from the client with the name of **cfg**.

Example:
```javascript
socket.emit('cfg', {
		ip : 'localhost',
		port : 8080,
		user : '',
		password : 'password'
	});
```

# Using
To use you have to emit the commands

Examples:

**Add to PlayList and Play**
```javascript
socket.emit('command', {
		command : 'addAndStart',
		params : {
			uri : '/path/to/the/file',
			noaudio : false,
			novideo : false
		}
	});
```
**Play**
```javascript
socket.emit('command', {
		command : 'play',
		params : {
			id: 0
		}
	});
```
**Stop**
```javascript
socket.emit('command', {
		command : 'stop'
	});
```

This commands will return an Object with informations that VLC will return.

