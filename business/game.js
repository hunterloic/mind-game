const Game = require('../models/game');
const SiteBusiness = require('./site');
const PlayerModel = require('../models/player');

class GameBusiness {

    constructor(game) {
        this.error = "";
        this.game = game;
    }

    sendToAllSocket(event, data) {
        
        this.game.players.forEach((p) => {
            p.getSocket().emit(event, data);
        });
    }

    getPlayer(username) {
        if(!this.game.players == this.game) {
            return;
        }
        this.game.players.filter((p) => { return p.name == username });
    }

    leaveGame(username) {
        if(!this.game.players == this.game) {
            return;
        }
        this.game.players = this.game.players.filter((p) => { return p.name != username });

        if(this.game.players.length == 0) {
            SiteBusiness.removeGame(this.game.host);
        }
    }

    disconnectGame(username) {
        var playerToUpdate = this.game.players.filter((p) => { return p.name == username });
        if(playerToUpdate.length == 0) {
            return;
        }

        playerToUpdate[0].status = 0;
        
        var connetedPlayers = this.game.players.filter((p) => { return p.status == 1 });

        if(connetedPlayers.length == 0) {
            SiteBusiness.removeGame(this.game.host);
        }
    }

    joinGame(username) {

        this.error = "";

        // if already in game, update status
        if(this.isAlreadyInGame(username)) {
            var playerToUpdate = this.game.players.filter((p) => { return p.name == username });
            playerToUpdate[0].status = 1;
            return true;
        }

        // not started
        if(this.game.status != 0) {
            this.error = "This game has already started";
            return false;
        }

        // game is full
        if(this.game.players.length >= SiteBusiness.getConfig().PlayerCountPerGameMax) {
            this.error = "This game is full";
            return false;
        }

        // Add player to the game
        var player = new PlayerModel(username);
        this.game.players.push(player);

        return true;
    }

    isAlreadyInGame(username) {

        // already in the game
        var playerNames = this.game.players.map((p) => { return p.name});
        return playerNames.includes(username);
    }

    setPlayerSocket = (username, socket) => {
        var playerToUpdate = this.game.players.filter((p) => { return p.name == username });
        if(playerToUpdate.length == 0) {
            return;
        }

        playerToUpdate[0].setSocket(socket);
    }

    startGame = () => {
        this.game.status = 1;
    }

    startNewTurn = () => {

        this.error = "";

        if(this.game.deck.length == 0) {
            this.error = "There is no more card to play";
            return false;
        }
        if(this.game.currentCards.length != 0) {
            this.error = "The current turn is not ended";
            return false;
        }

        this.game.currentCards = new Array();
        this.game.currentCards.push(this.game.deck.shift());

        return true;
    }

    restart() {
        this.game.deck = new Array();
        
        for(var i = -5; i <= 10; i++) {
            this.game.deck.push(i);
        }

        this.game.shuffle();
    }
}

module.exports = GameBusiness;


