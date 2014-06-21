var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var createId = (function() {
    var id = 0;
    return function() {
        return 'id' + (id++);
    };
})();

var users = {};

io.on('connection', function(socket){
    var id = createId();
    var user = {
        id: id,
        position: [2180.5, 645.4559936523438, 548.5],
        orientation: [-0.7071036100387573, -0, 0.7071099877357483, -0.12278840690851212, 0.9848077297210693, -0.12278729677200317, -0.6963673830032349, -0.17364825308322906, -0.6963610649108887],
        velocity: [-13.927347183227539, -3.4729650020599365, -13.927221298217773],
        lift: 0,
        bank: 0,
        boost: 0
    };

    console.log('connected (' + id + ')');

    socket.emit('welcome', {
        your_info: user,
        users: Object.keys(users).map(function(key){
            return users[key];
        })
    });

    socket.on('update', function(receivedData){
        var broadcastData = { id: id };

        if(receivedData.lift != null) {
            user.lift = receivedData.lift;
            broadcastData.lift = receivedData.lift;
        }

        if(receivedData.bank != null) {
            user.bank = receivedData.bank;
            broadcastData.bank = receivedData.bank;
        }

        if(receivedData.boost != null) {
            user.boost = receivedData.boost;
            broadcastData.boost = receivedData.boost;
        }

        if(receivedData.position != null) {
            user.position = receivedData.position;
            broadcastData.position = receivedData.position;
        }

        if(receivedData.orientation != null) {
            user.orientation = receivedData.orientation;
            broadcastData.orientation = receivedData.orientation;
        }

        if(receivedData.velocity != null) {
            user.velocity = receivedData.velocity;
            broadcastData.velocity = receivedData.velocity;
        }

        console.log(broadcastData);
        socket.broadcast.emit('update', broadcastData);
    });

    socket.on('disconnect', function(){
        console.log('disconnected (' + id + ')');
        socket.broadcast.emit('quit', user);
        delete users[id];
    });

    socket.broadcast.emit('join', user);

    users[id] = user;
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

