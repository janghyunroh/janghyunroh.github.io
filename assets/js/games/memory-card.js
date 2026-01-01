class MemoryCardGame {
  constructor() {
    this.cardGrid = document.querySelector('.card-grid');
    this.movesElement = document.querySelector('.moves');
    this.pairsElement = document.querySelector('.pairs');
    this.resetButton = document.querySelector('.reset-button');
    this.gameMessage = document.querySelector('.game-message');
    this.retryButton = document.querySelector('.retry-button');
    this.finalMovesElement = document.querySelector('.final-moves');

    this.emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎲', '🎰'];
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.canFlip = true;

    this.resetButton.addEventListener('click', () => this.reset());
    this.retryButton.addEventListener('click', () => this.reset());

    this.init();
  }

  init() {
    this.cards = this.shuffle([...this.emojis, ...this.emojis]);
    this.createCards();
  }

  reset() {
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.canFlip = true;
    this.movesElement.textContent = '0';
    this.pairsElement.textContent = `0 / ${this.emojis.length}`;
    this.gameMessage.classList.add('hidden');
    this.cardGrid.innerHTML = '';
    this.init();
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createCards() {
    this.cards.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.index = index;
      card.dataset.emoji = emoji;

      const cardFront = document.createElement('div');
      cardFront.classList.add('card-face', 'card-front');
      cardFront.textContent = emoji;

      const cardBack = document.createElement('div');
      cardBack.classList.add('card-face', 'card-back');

      card.appendChild(cardFront);
      card.appendChild(cardBack);

      card.addEventListener('click', () => this.flipCard(card));

      this.cardGrid.appendChild(card);
    });
  }

  flipCard(card) {
    if (!this.canFlip) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (this.flippedCards.length >= 2) return;

    card.classList.add('flipped');
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.movesElement.textContent = this.moves;
      this.checkMatch();
    }
  }

  checkMatch() {
    this.canFlip = false;

    const [card1, card2] = this.flippedCards;
    const emoji1 = card1.dataset.emoji;
    const emoji2 = card2.dataset.emoji;

    if (emoji1 === emoji2) {
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedPairs++;
        this.pairsElement.textContent = `${this.matchedPairs} / ${this.emojis.length}`;
        this.flippedCards = [];
        this.canFlip = true;

        if (this.matchedPairs === this.emojis.length) {
          this.gameWon();
        }
      }, 500);
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }

  gameWon() {
    this.finalMovesElement.textContent = `Completed in ${this.moves} moves!`;
    setTimeout(() => {
      this.gameMessage.classList.remove('hidden');
    }, 500);
  }
}

new MemoryCardGame();
