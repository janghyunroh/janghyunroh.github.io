class Minesweeper {
  constructor() {
    this.boardElement = document.querySelector('.board');
    this.minesCountElement = document.querySelector('.mines-count');
    this.timerElement = document.querySelector('.timer');
    this.resetButton = document.querySelector('.reset-button');
    this.gameMessage = document.querySelector('.game-message');
    this.retryButton = document.querySelector('.retry-button');
    this.messageText = document.querySelector('.message-text');
    this.finalTime = document.querySelector('.final-time');
    this.difficultyButtons = document.querySelectorAll('.difficulty-btn');

    this.difficulties = {
      easy: { rows: 8, cols: 8, mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard: { rows: 16, cols: 30, mines: 99 }
    };

    this.currentDifficulty = 'easy';
    this.board = [];
    this.revealed = [];
    this.flagged = [];
    this.gameStarted = false;
    this.gameOver = false;
    this.timer = 0;
    this.timerInterval = null;

    // Leaderboard
    this.leaderboard = new Leaderboard('minesweeper');
    this.leaderboardUI = new LeaderboardUI(this.leaderboard, 'leaderboard-modal');

    this.resetButton.addEventListener('click', () => this.reset());
    this.retryButton.addEventListener('click', () => this.reset());
    this.submitScoreButton = document.querySelector('.submit-score-button');
    this.submitScoreButton.addEventListener('click', () => this.handleSubmitScore());
    document.querySelector('.leaderboard-button').addEventListener('click', () => this.leaderboardUI.show());

    this.difficultyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.difficultyButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentDifficulty = e.target.dataset.difficulty;
        this.reset();
      });
    });

    this.init();
  }

  init() {
    const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
    this.board = Array(rows).fill().map(() => Array(cols).fill(0));
    this.revealed = Array(rows).fill().map(() => Array(cols).fill(false));
    this.flagged = Array(rows).fill().map(() => Array(cols).fill(false));
    this.minesCountElement.textContent = mines;
    this.createBoard();
  }

  reset() {
    this.gameStarted = false;
    this.gameOver = false;
    this.timer = 0;
    this.timerElement.textContent = '0';
    clearInterval(this.timerInterval);
    this.gameMessage.classList.add('hidden');
    this.init();
  }

  createBoard() {
    const { rows, cols } = this.difficulties[this.currentDifficulty];
    this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    this.boardElement.innerHTML = '';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener('click', () => this.handleLeftClick(row, col));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.handleRightClick(row, col);
        });

        this.boardElement.appendChild(cell);
      }
    }
  }

  placeMines(firstRow, firstCol) {
    const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
    let placed = 0;

    while (placed < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (this.board[row][col] !== -1 && (row !== firstRow || col !== firstCol)) {
        this.board[row][col] = -1;
        placed++;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValid(newRow, newCol) && this.board[newRow][newCol] !== -1) {
              this.board[newRow][newCol]++;
            }
          }
        }
      }
    }
  }

  isValid(row, col) {
    const { rows, cols } = this.difficulties[this.currentDifficulty];
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }

  handleLeftClick(row, col) {
    if (this.gameOver || this.flagged[row][col] || this.revealed[row][col]) return;

    if (!this.gameStarted) {
      this.gameStarted = true;
      this.placeMines(row, col);
      this.startTimer();
    }

    this.revealCell(row, col);
  }

  handleRightClick(row, col) {
    if (this.gameOver || this.revealed[row][col]) return;

    this.flagged[row][col] = !this.flagged[row][col];
    const cell = this.getCellElement(row, col);

    if (this.flagged[row][col]) {
      cell.classList.add('flagged');
    } else {
      cell.classList.remove('flagged');
    }

    this.updateMinesCount();
  }

  revealCell(row, col) {
    if (!this.isValid(row, col) || this.revealed[row][col]) return;

    this.revealed[row][col] = true;
    const cell = this.getCellElement(row, col);
    cell.classList.add('revealed');

    if (this.board[row][col] === -1) {
      cell.classList.add('mine');
      cell.textContent = '💣';
      this.endGame(false);
      return;
    }

    if (this.board[row][col] > 0) {
      cell.textContent = this.board[row][col];
      cell.classList.add(`num-${this.board[row][col]}`);
    } else {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.revealCell(row + dr, col + dc);
        }
      }
    }

    this.checkWin();
  }

  getCellElement(row, col) {
    return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  updateMinesCount() {
    const { mines } = this.difficulties[this.currentDifficulty];
    const flaggedCount = this.flagged.flat().filter(f => f).length;
    this.minesCountElement.textContent = mines - flaggedCount;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }

  checkWin() {
    const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
    const totalCells = rows * cols;
    const revealedCount = this.revealed.flat().filter(r => r).length;

    if (revealedCount === totalCells - mines) {
      this.endGame(true);
    }
  }

  endGame(won) {
    this.gameOver = true;
    clearInterval(this.timerInterval);

    // Score calculation: lower time is better (use negative for leaderboard sorting)
    const score = won ? -this.timer : 0;
    const isHighScore = won && this.leaderboard.isHighScore(score);

    if (won) {
      this.messageText.textContent = `You Win! 🎉${isHighScore ? ' New Best Time!' : ''}`;
      this.messageText.style.color = '#4CAF50';
    } else {
      this.messageText.textContent = 'Game Over! 💥';
      this.messageText.style.color = '#f44336';
      this.revealAllMines();
    }

    this.finalTime.textContent = `Time: ${this.timer}s${won ? ` | Difficulty: ${this.currentDifficulty}` : ''}`;
    this.gameMessage.classList.remove('hidden');
  }

  async handleSubmitScore() {
    if (!this.gameStarted || this.timer === 0) {
      alert('Play the game first!');
      return;
    }

    const playerName = await this.leaderboardUI.promptForName();
    // Negative time for sorting (lower time = higher score)
    const success = await this.leaderboard.submitScore(playerName, -this.timer, {
      time: this.timer,
      difficulty: this.currentDifficulty
    });

    if (success) {
      alert('Score submitted successfully!');
    } else {
      alert('Score saved locally!');
    }

    this.leaderboardUI.show();
  }

  revealAllMines() {
    const { rows, cols } = this.difficulties[this.currentDifficulty];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.board[row][col] === -1) {
          const cell = this.getCellElement(row, col);
          cell.classList.add('revealed', 'mine');
          cell.textContent = '💣';
        }
      }
    }
  }
}

new Minesweeper();
