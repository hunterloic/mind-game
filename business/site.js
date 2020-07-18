const Game = require('../models/game');
const Config = require('../models/config');
const GameBusiness = require('./game');

const _config = new Config();
var _games = new Array();

class SiteBusiness {

    constructor() {
        this.error = "";
    }

    static getGameBusiness(host) {
        
        var game = SiteBusiness.getGame(host);
        if(!game) {
            return undefined;
        }
        var gameBusiness = new GameBusiness(game);
        if(!gameBusiness) {
            return undefined;
        }

        return gameBusiness;
    }

    static getConfig() {
        return _config;
    }

    static getGames() {
        return _games;
    }

    static getGame(host) {
        return _games.filter((g) => { return g.host == host})[0];
    }

    static removeGame(host) {
        _games = _games.filter((g) => { return g.host != host});
    }

    static addGame(game) {
        
        this.error = "";

        if(_games.length >= _config.maxGamesNo) {
            this.error = "The number max of " + _config.maxGamesNo + " game has been reached.";
            return false;
        }

        if(_games.filter((g) => { return g.host == game.host}).length > 0) {
            this.error = "You have already created a game.";
            return false;
        }

        _games.push(game);

        return true;
    }
}

module.exports = SiteBusiness;


