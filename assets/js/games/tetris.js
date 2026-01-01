class TetrisGame {
  constructor() {
    this.canvas = document.getElementById('tetrisCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.nextCanvas = document.getElementById('nextCanvas');
    this.nextCtx = this.nextCanvas.getContext('2d');
    this.holdCanvas = document.getElementById('holdCanvas');
    this.holdCtx = this.holdCanvas.getContext('2d');
    this.scoreElement = document.querySelector('.score');
    this.linesElement = document.querySelector('.lines');
    this.resetButton = document.querySelector('.reset-button');
    this.gameMessage = document.querySelector('.game-message');
    this.retryButton = document.querySelector('.retry-button');
    this.finalScoreElement = document.querySelector('.final-score');

    this.blockSize = 30;
    this.cols = 10;
    this.rows = 20;
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.gameLoop = null;
    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.lastTime = 0;

    this.colors = [
      null,
      '#FF6B6B', // I
      '#4ECDC4', // O
      '#45B7D1', // T
      '#FFA07A', // S
      '#98D8C8', // Z
      '#F7DC6F', // J
      '#BB8FCE'  // L
    ];

    this.pieces = {
      'I': [[1,1,1,1]],
      'O': [[2,2],[2,2]],
      'T': [[0,3,0],[3,3,3]],
      'S': [[0,4,4],[4,4,0]],
      'Z': [[5,5,0],[0,5,5]],
      'J': [[6,0,0],[6,6,6]],
      'L': [[0,0,7],[7,7,7]]
    };

    this.currentPiece = null;
    this.nextPiece = null;
    this.holdPiece = null;
    this.canHold = true;
    this.currentX = 0;
    this.currentY = 0;

    // Leaderboard
    this.leaderboard = new Leaderboard('tetris');
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
    this.nextPiece = this.getRandomPiece();
    this.spawnPiece();
    this.update();
  }

  reset() {
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.holdPiece = null;
    this.canHold = true;
    this.gameMessage.classList.add('hidden');
    this.updateScore();
    this.nextPiece = this.getRandomPiece();
    this.drawHold();
    this.spawnPiece();
    this.update();
  }

  getRandomPiece() {
    const pieces = Object.keys(this.pieces);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return JSON.parse(JSON.stringify(this.pieces[randomPiece]));
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomPiece();
    this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece[0].length / 2);
    this.currentY = 0;
    this.canHold = true;

    if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
      this.gameOver();
    }

    this.drawNext();
  }

  handleKeyPress(e) {
    if (!this.currentPiece) return;

    if (e.key === 'ArrowLeft') {
      this.movePiece(-1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      this.movePiece(1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      this.dropPiece();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      this.rotatePiece();
      e.preventDefault();
    } else if (e.key === ' ') {
      this.hardDrop();
      e.preventDefault();
    } else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') {
      this.holdCurrentPiece();
      e.preventDefault();
    }
  }

  movePiece(dir) {
    this.currentX += dir;
    if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
      this.currentX -= dir;
    }
    this.draw();
  }

  dropPiece() {
    this.currentY++;
    if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
      this.currentY--;
      this.mergePiece();
      this.clearLines();
      this.spawnPiece();
    }
    this.dropCounter = 0;
    this.draw();
  }

  hardDrop() {
    while (!this.checkCollision(this.currentPiece, this.currentX, this.currentY + 1)) {
      this.currentY++;
    }
    this.mergePiece();
    this.clearLines();
    this.spawnPiece();
    this.draw();
  }

  rotatePiece() {
    const rotated = this.currentPiece[0].map((_, i) =>
      this.currentPiece.map(row => row[i]).reverse()
    );

    if (!this.checkCollision(rotated, this.currentX, this.currentY)) {
      this.currentPiece = rotated;
    }
    this.draw();
  }

  checkCollision(piece, x, y) {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return true;
          }
          if (newY >= 0 && this.grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  mergePiece() {
    for (let row = 0; row < this.currentPiece.length; row++) {
      for (let col = 0; col < this.currentPiece[row].length; col++) {
        if (this.currentPiece[row][col] !== 0) {
          const y = this.currentY + row;
          const x = this.currentX + col;
          if (y >= 0) {
            this.grid[y][x] = this.currentPiece[row][col];
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.grid[row].every(cell => cell !== 0)) {
        this.grid.splice(row, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        linesCleared++;
        row++;
      }
    }

    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += [0, 100, 300, 500, 800][linesCleared];
      this.updateScore();
    }
  }

  update(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += deltaTime;

    if (this.dropCounter > this.dropInterval) {
      this.dropPiece();
    }

    this.draw();
    requestAnimationFrame((t) => this.update(t));
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.cols; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.blockSize, 0);
      this.ctx.lineTo(i * this.blockSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i <= this.rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.blockSize);
      this.ctx.lineTo(this.canvas.width, i * this.blockSize);
      this.ctx.stroke();
    }

    // Draw placed blocks
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] !== 0) {
          this.drawBlock(col, row, this.grid[row][col]);
        }
      }
    }

    // Draw current piece
    if (this.currentPiece) {
      for (let row = 0; row < this.currentPiece.length; row++) {
        for (let col = 0; col < this.currentPiece[row].length; col++) {
          if (this.currentPiece[row][col] !== 0) {
            this.drawBlock(
              this.currentX + col,
              this.currentY + row,
              this.currentPiece[row][col]
            );
          }
        }
      }
    }
  }

  drawBlock(x, y, colorIndex) {
    this.ctx.fillStyle = this.colors[colorIndex];
    this.ctx.fillRect(
      x * this.blockSize + 1,
      y * this.blockSize + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );
  }

  holdCurrentPiece() {
    if (!this.canHold) return;

    if (this.holdPiece === null) {
      this.holdPiece = this.currentPiece;
      this.spawnPiece();
    } else {
      const temp = this.currentPiece;
      this.currentPiece = this.holdPiece;
      this.holdPiece = temp;
      this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece[0].length / 2);
      this.currentY = 0;

      if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
        this.currentPiece = this.holdPiece;
        this.holdPiece = temp;
        return;
      }
    }

    this.canHold = false;
    this.drawHold();
    this.draw();
  }

  drawNext() {
    this.nextCtx.fillStyle = '#1a1a1a';
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    const blockSize = 25;
    const offsetX = (this.nextCanvas.width - this.nextPiece[0].length * blockSize) / 2;
    const offsetY = (this.nextCanvas.height - this.nextPiece.length * blockSize) / 2;

    for (let row = 0; row < this.nextPiece.length; row++) {
      for (let col = 0; col < this.nextPiece[row].length; col++) {
        if (this.nextPiece[row][col] !== 0) {
          this.nextCtx.fillStyle = this.colors[this.nextPiece[row][col]];
          this.nextCtx.fillRect(
            offsetX + col * blockSize + 1,
            offsetY + row * blockSize + 1,
            blockSize - 2,
            blockSize - 2
          );
        }
      }
    }
  }

  drawHold() {
    this.holdCtx.fillStyle = '#1a1a1a';
    this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

    if (this.holdPiece === null) return;

    const blockSize = 25;
    const offsetX = (this.holdCanvas.width - this.holdPiece[0].length * blockSize) / 2;
    const offsetY = (this.holdCanvas.height - this.holdPiece.length * blockSize) / 2;

    for (let row = 0; row < this.holdPiece.length; row++) {
      for (let col = 0; col < this.holdPiece[row].length; col++) {
        if (this.holdPiece[row][col] !== 0) {
          this.holdCtx.fillStyle = this.colors[this.holdPiece[row][col]];
          this.holdCtx.fillRect(
            offsetX + col * blockSize + 1,
            offsetY + row * blockSize + 1,
            blockSize - 2,
            blockSize - 2
          );
        }
      }
    }
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
    this.linesElement.textContent = this.lines;
  }

  gameOver() {
    this.currentPiece = null;
    const isHighScore = this.leaderboard.isHighScore(this.score);
    this.finalScoreElement.textContent = `Score: ${this.score} | Lines: ${this.lines}${isHighScore ? ' 🎉 New High Score!' : ''}`;
    this.gameMessage.classList.remove('hidden');
  }

  async handleSubmitScore() {
    const playerName = await this.leaderboardUI.promptForName();
    const success = await this.leaderboard.submitScore(playerName, this.score, {
      lines: this.lines
    });

    if (success) {
      alert('Score submitted successfully!');
    } else {
      alert('Score saved locally!');
    }

    this.leaderboardUI.show();
  }
}

new TetrisGame();
