const GameModel = require('./models/game');
const GameBusiness = require('./business/game');
const SiteBusiness = require('./business/site');

const socket = (io) => {

    io.on('connection', (socket) => {
        console.log('a user connected');
    
        socket.on('playerJoin', (joinInfos) => {
            try {

                console.log('player join');
                
                // var gameBusiness = SiteBusiness.getGameBusiness(joinInfos.gameHost);
                var game = SiteBusiness.getGame(joinInfos.gameHost);
                if(!game) {
                    return;
                }
                var gameBusiness = new GameBusiness(game);
                if(!gameBusiness) {
                    return;
                }
    
                // check if the game is not started
                if(gameBusiness.game.status != 0) {
                    console.log('game already started');
                    return;
                }

                if(gameBusiness.isAlreadyInGame(joinInfos.username)) {
                    return;
                }

                gameBusiness.joinGame(joinInfos.username);

                io.sockets.emit('playerJoin', joinInfos);
            } catch(ex) {
                console.log(ex);
            }

        });

        socket.on('playerLeave', (leaveInfos) => {
            try {

                console.log("disconnect");

                // var gameBusiness = SiteBusiness.getGameBusiness(leaveInfos.gameHost);
                var game = SiteBusiness.getGame(leaveInfos.gameHost);
                if(!game) {
                    return;
                }
                var gameBusiness = new GameBusiness(game);
                if(!gameBusiness) {
                    return;
                }

                gameBusiness.leaveGame(leaveInfos.username);

                io.sockets.emit('playerLeave', leaveInfos);
                
            } catch(ex) {
                console.log(ex);
            }

        });
    
    });
}

module.exports = socket;
