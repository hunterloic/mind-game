class Player {
    constructor(name) {
      this.name = name;
      this.cards = new Array();
      for(var i = 1; i <= 15 ; i++) {
          this.cards.push(i);
      }
      this.rewards = new Array();
      this.currentCard = "";
      this.status = 1; // 1: in-game, 0: left

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