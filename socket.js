const GameModel = require('./models/game');
const GameBusiness = require('./business/game');
const SiteBusiness = require('./business/site');



const socket = (io) => {

    io.on('connection', (socket) => {
        console.log('a user connected');


        var gameBusiness;
        var username;
        var event;
            
        const sendError = (message) => {
            var messageFormatted = event + ' : ' + username + ' : ' + (gameBusiness ? (gameBusiness.game  ? gameBusiness.game.host : '') : '') + ' : ' + message;
            console.log(event + ' : ' + message);
            socket.emit('err', {error : event + ' : ' + message});
        }
    
        socket.on('playerJoin', (joinInfos) => {

            try {

                event = 'playerJoin';
                username = joinInfos.username;

                console.log('player join');
                
                var game = SiteBusiness.getGame(joinInfos.gameHost);
                if(!game) {
                    sendError('SiteBusiness init error');
                    return;
                }
                
                gameBusiness = new GameBusiness(game);
                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }
    

                // check if the game is not started
                if(gameBusiness.game.status != 0) {
                    sendError('game already started');
                    return;
                }

                // check if already in game
                if(gameBusiness.isAlreadyInGame(joinInfos.username)) {
                    console.log('already in game');
                    return;
                }

                // join game and check error
                if(!gameBusiness.joinGame(joinInfos.username)) {
                    sendError(gameBusiness.error);
                    return;
                }

                io.sockets.emit('playerJoin', joinInfos);
            } catch(ex) {
                console.log(ex);
                socket.emit('err', {error : ex});
            }

        });

        socket.on('playerLeave', (leaveInfos) => {
            try {

                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }

                gameBusiness.leaveGame(username);

                io.sockets.emit('playerLeave', { gameHost : gameBusiness.game.host, username : username});
                
            } catch(ex) {
                console.log(ex);
                socket.emit('error', {error : ex});
            }

        });
    
    });
}

module.exports = socket;
