const GameModel = require('./models/game');
const GameBusiness = require('./business/game');
const SiteBusiness = require('./business/site');



const socket = (io) => {

    io.on('connection', (socket) => {

        var gameBusiness;
        var username = "";
        var event = "connection";
            
        const sendError = (message) => {
            var messageFormatted = event + ' : ' + username + ' : ' + (gameBusiness ? (gameBusiness.game  ? gameBusiness.game.host : '') : '') + ' : ' + message;
            console.log(messageFormatted);
            socket.emit('err', {error : messageFormatted});
        }
            
        const log = (message) => {
            var messageFormatted = event + ' : ' + username + ' : ' + (gameBusiness ? (gameBusiness.game  ? gameBusiness.game.host : '') : '') + ' : ' + message;
            console.log(messageFormatted);
        }

        log('a user connected');
    
        socket.on('playerJoin', (joinInfos) => {

            try {

                event = 'playerJoin';
                username = joinInfos.username;
                log('player join');

                
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
                if(gameBusiness.game.status != 0 && 
                    !gameBusiness.isAlreadyInGame(username)) {
                    sendError('game already started');
                    return;
                }

                // join game and check error
                if(!gameBusiness.joinGame(username)) {
                    sendError(gameBusiness.error);
                    return;
                }

                // set player socket
                gameBusiness.setPlayerSocket(username, socket);

                gameBusiness.sendToAllSocket('playerJoin', { game : game, data : joinInfos});
            } catch(ex) {
                log(ex);
                socket.emit('err', {error : ex});
            }

        });

        socket.on('playerLeave', () => {
            try {

                event = 'playerLeave';
                log('player leave');

                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }

                var leaveinfos = { gameHost : gameBusiness.game.host, username : username};

                gameBusiness.leaveGame(username);
                gameBusiness.sendToAllSocket('playerLeave', { game : gameBusiness.game, data : leaveinfos});

                
            } catch(ex) {
                log(ex);
                socket.emit('error', {error : ex});
            }

        });

        socket.on('playerDisconnect', () => {
            try {

                event = 'playerDisconnect';
                log('player disconnect');

                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }

                var leaveinfos = { gameHost : gameBusiness.game.host, username : username};

                gameBusiness.disconnectGame(username);
                gameBusiness.sendToAllSocket('playerDisconnect', { game : gameBusiness.game, data : leaveinfos});
                
            } catch(ex) {
                log(ex);
                socket.emit('error', {error : ex});
            }

        });

        socket.on('gameStart', () => {
            try {


                event = 'gameStart';
                log('gameStart');

                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }

                // Start Game
                gameBusiness.startGame();

                // Set new turn
                if(!gameBusiness.startNewTurn()) {
                    sendError(gameBusiness.error);
                    return;
                }

                gameBusiness.sendToAllSocket('gameStart', gameBusiness.game);

            } catch(ex) {
                log(ex);
                socket.emit('error', {error : ex});
            }

        });

        socket.on('playCard', (card) => {
            try {

                event = 'playCard';
                log('playCard');

                if(!gameBusiness) {
                    sendError('GameBusiness init error');
                    return;
                }

                gameBusiness.playerPayCard(username, card);

                gameBusiness.sendToAllSocket('playCard', { game: gameBusiness.game, play: { username: username, card: card } }, username);

                if(gameBusiness.allUserPlayedCard()) {

                    gameBusiness.processTurn();

                    if(gameBusiness.game.deck.length > 0) {
                        gameBusiness.startNewTurn();
                    }

                    gameBusiness.sendToAllSocket('turnAllCardsPlayed', gameBusiness.game);
                    
                    if(gameBusiness.game.deck.length == 0) {
                        gameBusiness.calculateWinner();
                        gameBusiness.sendToAllSocket('gameFinished', gameBusiness.game);
                    }
                }

            } catch(ex) {
                log(ex);
                socket.emit('error', {error : ex});
            }

        });
    
    });
}

module.exports = socket;
