class Player {

    #socket;

    constructor(name) {
      this.name = name;
      this.cards = new Array();
      for(var i = 1; i <= 15 ; i++) {
          this.cards.push(i);
      }
      this.rewards = new Array();
      this.currentCard = "";
      this.previousCard = "";
      this.status = 1; // 1: in-game, 0: left
      this.points = 0;

    }

    setSocket(socket) {
        this.#socket = socket;
    }

    getSocket() {
        return this.#socket;
    }
}

module.exports = Player;