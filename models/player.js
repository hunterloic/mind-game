class Player {
    constructor(name) {
      this.name = name;
      this.cards = new Array();
      this.rewards = new Array();
      this.currentCard = "";
      this.socketId;
    }

    initialize() {
        this.cards = new Array();
        for(var i = 1; i <= 15 ; i++) {
            this.cards.push(i);
        }
        this.rewards = new Array();
        this.currentCard = "";
    }
}

module.exports = Player;