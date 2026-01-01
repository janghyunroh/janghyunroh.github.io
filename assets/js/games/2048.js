class Game2048 {
  constructor() {
    this.grid = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.gridElement = document.querySelector('.grid');
    this.scoreElement = document.querySelector('.score');
    this.resetButton = document.querySelector('.reset-button');
    this.gameMessage = document.querySelector('.game-message');
    this.retryButton = document.querySelector('.retry-button');

    // Leaderboard
    this.leaderboard = new Leaderboard('2048');
    this.leaderboardUI = new LeaderboardUI(this.leaderboard, 'leaderboard-modal');

    this.resetButton.addEventListener('click', () => this.reset());
    this.retryButton.addEventListener('click', () => this.reset());
    this.submitScoreButton = document.querySelector('.submit-score-button');
    this.submitScoreButton.addEventListener('click', () => this.handleSubmitScore());
    document.querySelector('.leaderboard-button').addEventListener('click', () => this.leaderboardUI.show());
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    this.init();
  }

  init() {
    this.createGrid();
    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  reset() {
    this.grid = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.gameMessage.classList.add('hidden');
    this.init();
  }

  createGrid() {
    this.gridElement.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.classList.add('tile');
      this.gridElement.appendChild(cell);
    }
  }

  addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  render() {
    const tiles = this.gridElement.querySelectorAll('.tile');
    let index = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const value = this.grid[i][j];
        tiles[index].textContent = value || '';
        tiles[index].setAttribute('data-value', value || '0');
        index++;
      }
    }
    this.scoreElement.textContent = this.score;
  }

  handleKeyPress(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const moved = this.move(e.key);
      if (moved) {
        this.addRandomTile();
        this.render();
        if (this.checkWin()) {
          this.showMessage('You Win!');
        } else if (this.checkGameOver()) {
          this.showMessage('Game Over!');
        }
      }
    }
  }

  move(direction) {
    let moved = false;
    const oldGrid = JSON.stringify(this.grid);

    if (direction === 'ArrowLeft') {
      for (let i = 0; i < 4; i++) {
        const row = this.grid[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            this.score += row[j];
            row.splice(j + 1, 1);
          }
        }
        while (row.length < 4) row.push(0);
        this.grid[i] = row;
      }
    } else if (direction === 'ArrowRight') {
      for (let i = 0; i < 4; i++) {
        const row = this.grid[i].filter(val => val !== 0);
        for (let j = row.length - 1; j > 0; j--) {
          if (row[j] === row[j - 1]) {
            row[j] *= 2;
            this.score += row[j];
            row.splice(j - 1, 1);
            j--;
          }
        }
        while (row.length < 4) row.unshift(0);
        this.grid[i] = row;
      }
    } else if (direction === 'ArrowUp') {
      for (let j = 0; j < 4; j++) {
        const col = [];
        for (let i = 0; i < 4; i++) {
          if (this.grid[i][j] !== 0) col.push(this.grid[i][j]);
        }
        for (let i = 0; i < col.length - 1; i++) {
          if (col[i] === col[i + 1]) {
            col[i] *= 2;
            this.score += col[i];
            col.splice(i + 1, 1);
          }
        }
        while (col.length < 4) col.push(0);
        for (let i = 0; i < 4; i++) {
          this.grid[i][j] = col[i];
        }
      }
    } else if (direction === 'ArrowDown') {
      for (let j = 0; j < 4; j++) {
        const col = [];
        for (let i = 0; i < 4; i++) {
          if (this.grid[i][j] !== 0) col.push(this.grid[i][j]);
        }
        for (let i = col.length - 1; i > 0; i--) {
          if (col[i] === col[i - 1]) {
            col[i] *= 2;
            this.score += col[i];
            col.splice(i - 1, 1);
            i--;
          }
        }
        while (col.length < 4) col.unshift(0);
        for (let i = 0; i < 4; i++) {
          this.grid[i][j] = col[i];
        }
      }
    }

    moved = JSON.stringify(this.grid) !== oldGrid;
    return moved;
  }

  checkWin() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 2048) return true;
      }
    }
    return false;
  }

  checkGameOver() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) return false;
        if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return false;
        if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return false;
      }
    }
    return true;
  }

  showMessage(message) {
    const isHighScore = this.leaderboard.isHighScore(this.score);
    this.gameMessage.querySelector('p').textContent = `${message}${isHighScore ? ' 🎉 New High Score!' : ''}`;
    this.gameMessage.classList.remove('hidden');
  }

  async handleSubmitScore() {
    const playerName = await this.leaderboardUI.promptForName();
    const success = await this.leaderboard.submitScore(playerName, this.score);

    if (success) {
      alert('Score submitted successfully!');
    } else {
      alert('Score saved locally!');
    }

    this.leaderboardUI.show();
  }
}

new Game2048();
