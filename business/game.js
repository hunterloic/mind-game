const Game = require('../models/game');
const SiteBusiness = require('./site');
const PlayerModel = require('../models/player');

class GameBusiness {

    constructor(game) {
        this.error = "";
        this.game = game;
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
            SiteBusiness.removeGame(this.game.host)
        }
    }

    joinGame(username) {
        if(!this.game.players == this.game) {
            return;
        }

        this.error = "";

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

        if(this.isAlreadyInGame(username)) {
            return true;
        }

        // Add player to the 
        var player = new PlayerModel(username);
        this.game.players.push(player);

        return true;
    }

    isAlreadyInGame(username) {

        // already in the game
        var playerNames = this.game.players.map((p) => { return p.name});
        return playerNames.includes(username);
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


