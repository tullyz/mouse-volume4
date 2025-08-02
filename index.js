var Mouse = require('node-mouse');
var mouseDevice = new Mouse();

var InputEvent = require('input-event');
// find # of mouse event
const execSync = require('child_process').execSync;
const result =  execSync('cat /proc/bus/input/devices | grep mouse0').toString();
n = result.indexOf("event")
var a = result.substring(n+5, n+6)
var input = new InputEvent('/dev/input/event'+a);

var eventDevice = new InputEvent.Mouse(input);

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

// set initial volume value
var vol = 3;  
socket.emit('volume', vol);


const stations = ["Venice Classic Radio", "Capital UK", "Classic FM"];
let playstate = 1; // 0: Venice, 1: Capital, 2: Classic

// Rotate the channel when a either button is clicked
// Mute when a wheel button is clicked
mouseDevice.on('click', function(e){
  if (e.button === 0) {
//    console.log("left click");
    playstate = (playstate + 2) % stations.length;
    socket.emit('playPlaylist', { name: stations[playstate] });
  }
  if (e.button === 2) {
//    console.log("right click");
    playstate = (playstate + 1) % stations.length;
    socket.emit('playPlaylist', { name: stations[playstate] });
  }
  if (e.button === 1) {
//    console.log("wheel click");
//    socket.emit('prev');
//    socket.emit('next');
  if (playstate == 1) {
	socket.emit('pause');
	playstate = 0
	}
  else {
	socket.emit('play');
	playstate = 1 
	}
  }
});

// volume setting    
eventDevice.on('wheel', e => {
  var direction = e.value === 1 ? 1 : -1;
  socket.emit('getState', '');
  socket.on('pushState', function(data) {
    vol = data.volume;  
  });
  vol = vol + direction;
  if (vol < 0) vol = 0;
  if (vol > 100) vol = 100;
  socket.emit('volume', vol);
});


function createPlaylistIfNeeded(socket) {
    console.log("Checking playlist...");
    socket.emit('listPlaylist');
    socket.on('pushListPlaylist', function(data) {
        if (data.length == 0) {
            socket.emit('createPlaylist', {"name":"Venice Classic Radio"});
            socket.emit('addToPlaylist', {
                "name":"Venice Classic Radio", 
                "service":"webradio", 
                "uri":"https://uk2.streamingpulse.com/ssl/vcr1"
            });
            socket.emit('createPlaylist', {"name":"Capital UK"});
            socket.emit('addToPlaylist', {
                "name":"Capital UK", 
                "service":"webradio", 
                "uri":"https://media-ssl.musicradio.com/Capital"
            });
            socket.emit('createPlaylist', { name: "Classic FM" });
            socket.emit('addToPlaylist', {
            name: "Classic FM",
            service: "webradio",
            uri: "https://media-the.musicradio.com/ClassicFM"
            });
        }
    });
}




function checkAndPlay() {
    console.log("Checking Volumio state...");

    const http = require('http');

    http.get('http://localhost:3000/api/v1/getState', (res) => {
        let data = '';

        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            try {
                let jsonData = JSON.parse(data);
                //console.log("Received Volumio state:", jsonData);

                if (["stop", "play", "pause"].includes(jsonData.status)) {
                    //console.log("MPD is ready! Connecting to WebSocket...");

                    var socket = io.connect('http://localhost:3000');

                    socket.on('connect', function() {
                        //console.log("WebSocket connected! Sending play command...");

                        // create Play list if not exist
                        createPlaylistIfNeeded(socket);

                        // Sent play command
                        socket.emit('play');
                        console.log("Sent play command.");

                        // check state, sent play command again if not playing
                        setTimeout(() => {
                            http.get('http://localhost:3000/api/v1/getState', (res) => {
                                let data = '';
                                res.on('data', chunk => { data += chunk; });
                                res.on('end', () => {
                                    try {
                                        let jsonData = JSON.parse(data);
                                        //console.log("Received Volumio state after play command:", jsonData);

                                        if (jsonData.status === 'stop') {
                                            //console.log("Re-sending play command...");
                                            socket.emit('play');
                                            // Re-sending play command again
                                            setTimeout(() => {
                                                //console.log("Re-sending play command again...");
                                                socket.emit('play');
                                            }, 5000); // after 5 sec
                                        } else {
                                            //console.log("Reproduction started successfully.");
                                        }
                                    } catch (e) {
                                        //console.log("Error parsing Volumio state after recheck:", e.message);
                                    }
                                });
                            });
                        }, 2000); // check state after 2sec 
                    });

                    socket.on('error', function(error) {
                        //console.log("WebSocket error:", error);
                    });

                    socket.on('disconnect', function() {
                        //console.log("WebSocket disconnected.");
                    });

                } else {
                    //console.log("MPD not ready yet (status: " + jsonData.status + "), retrying in 5 seconds...");
                    setTimeout(checkAndPlay, 5000);
                }
            } catch (e) {
                //console.log("Error parsing Volumio state:", e.message);
                setTimeout(checkAndPlay, 5000);
            }
        });
    }).on('error', (e) => {
        //console.log("Error accessing Volumio API:", e.message);
        //console.log("Retrying in 5 seconds...");
        setTimeout(checkAndPlay, 5000); // retry
    });
}

// Execute at startup
checkAndPlay();
