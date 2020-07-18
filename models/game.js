class Game {
    constructor(host) {
        this.status = 0; // 0 : not started, 1 on going, 2 ended
        this.players = new Array(); // Array of player model
        this.host = host;
        this.winner = 0;
        this.deck = new Array();
        this.winners = new Array();
        this.currentCards = new Array(); // List currently playing cards
        this.lock = false;

        for(var i = -5; i <= 10; i++) {
            if(i != 0) {
                this.deck.push(i);
            }
        }

        this.shuffle();
    }

    shuffle() {
        this.deck.sort(() => Math.random() - 0.5);
    }
}

module.exports = Game;