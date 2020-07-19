const Game = require('../models/game');
const SiteBusiness = require('./site');
const PlayerModel = require('../models/player');

class GameBusiness {

    constructor(game) {
        this.error = "";
        this.game = game;
    }

    sendToAllSocket(event, data, exclusion) {
        
        this.game.players.forEach((p) => {
            if(exclusion) {
                if(p.name == exclusion) {
                    return;
                }
            }
            p.getSocket().emit(event, data);
        });
    }

    playerPayCard(username, card) {
        var playerToUpdate = this.game.players.filter((p) => { return p.name == username });
        if(playerToUpdate.length == 0) {
            return;
        }

        playerToUpdate[0].currentCard = card;
    }

    allUserPlayedCard() {
        return this.game.players.filter((p) => { return p.currentCard == "" }).length == 0;
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

    setPlayerSocket(username, socket) {
        var playerToUpdate = this.game.players.filter((p) => { return p.name == username });
        if(playerToUpdate.length == 0) {
            return;
        }

        playerToUpdate[0].setSocket(socket);
    }

    startGame() {
        this.game.status = 1;
    }

    startNewTurn() {

        this.error = "";

        if(this.game.deck.length == 0) {
            this.error = "There is no more card to play";
            return false;
        }

        this.game.currentCards.push(this.game.deck.shift());

        return true;
    }

    processTurn() {
        
        this.error = "";

        var pointSum = 0;
        for(var i = 0; i< this.game.currentCards.length; i++) {
            pointSum += this.game.currentCards[i];   
        }

        // search winners
        var winPlayers = new Array();
        for(var i = 0; i<this.game.players.length; i++) {
            var player = this.game.players[i];
            if(winPlayers.length == 0) {
                winPlayers.push(player);
            } else {
                if(pointSum > 0)  {
                    if(player.currentCard < winPlayers[0].currentCard) {
                        winPlayers = new Array();
                        winPlayers.push(player);
                    } else if(player.currentCard == winPlayers[0].currentCard) { 
                        winPlayers.push(player);
                    }
                } else {
                    if(player.currentCard > winPlayers[0].currentCard) {
                        winPlayers = new Array();
                        winPlayers.push(player);
                    } else if(player.currentCard == winPlayers[0].currentCard) { 
                        winPlayers.push(player);
                    }
                }
            }
        }

        // update player cards
        this.game.players.forEach((p) => {
            p.previousCard = p.currentCard;
            p.cards = p.cards.filter((c) => c != p.currentCard);
            p.currentCard = "";
        });


        if(winPlayers.length > 1) {
            // multiple winners, do not reset playing cards
        } else {
            // add rewards to player            
            winPlayers[0].rewards = winPlayers[0].rewards.concat(this.game.currentCards);
            winPlayers[0].points += pointSum;

            // 1 winner, reset playing cards
            this.game.currentCards = new Array();
        }

    }

    calculateWinner() {
        this.game.players.forEach((p) => {
            p.points = p.rewards.reduce(function(acc, val) { return acc + val; }, 0);
        });

        var winners = new Array();
        var winnerPoints = 0;
        for(var i = 0; i<this.game.players.length; i++) {
            var player = this.game.players[i];
            
            if(winners.length == 0) {
                winners.push(player.name);
                winnerPoints = player.points;
            } else {
                if(player.points > winnerPoints) {
                    winners = new Array();
                    winners.push(player.name);
                    winnerPoints = player.points;
                } else if(player.points == winnerPoints) {
                    winners.push(player.name);
                }
            }
        }
        this.game.winners = winners;
    }
}

module.exports = GameBusiness;


