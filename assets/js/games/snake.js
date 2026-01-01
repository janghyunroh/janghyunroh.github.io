class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('snakeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.querySelector('.score');
    this.resetButton = document.querySelector('.reset-button');
    this.gameMessage = document.querySelector('.game-message');
    this.retryButton = document.querySelector('.retry-button');
    this.finalScoreElement = document.querySelector('.final-score');

    this.gridSize = 20;
    this.tileCount = 20;
    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameLoop = null;
    this.speed = 100;

    // Leaderboard
    this.leaderboard = new Leaderboard('snake');
    this.leaderboardUI = new LeaderboardUI(this.leaderboard, 'leaderboard-modal');

    this.resetButton.addEventListener('click', () => this.reset());
    this.retryButton.addEventListener('click', () => this.reset());
    this.submitScoreButton = document.querySelector('.submit-score-button');
    this.submitScoreButton.addEventListener('click', () => this.handleSubmitScore());
    document.querySelector('.leaderboard-button').addEventListener('click', () => this.leaderboardUI.show());
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    this.start();
  }

  start() {
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  reset() {
    clearInterval(this.gameLoop);
    this.snake = [{ x: 10, y: 10 }];
    this.food = this.generateFood();
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameMessage.classList.add('hidden');
    this.updateScore();
    this.start();
  }

  handleKeyPress(e) {
    const key = e.key;

    if (key === 'ArrowUp' && this.dy === 0) {
      this.dx = 0;
      this.dy = -1;
      e.preventDefault();
    } else if (key === 'ArrowDown' && this.dy === 0) {
      this.dx = 0;
      this.dy = 1;
      e.preventDefault();
    } else if (key === 'ArrowLeft' && this.dx === 0) {
      this.dx = -1;
      this.dy = 0;
      e.preventDefault();
    } else if (key === 'ArrowRight' && this.dx === 0) {
      this.dx = 1;
      this.dy = 0;
      e.preventDefault();
    }
  }

  update() {
    if (this.dx === 0 && this.dy === 0) {
      this.draw();
      return;
    }

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Check wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // Check self collision
    for (let segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.updateScore();
      this.food = this.generateFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#66BB6A';
      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });

    // Draw food
    this.ctx.fillStyle = '#f44336';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
  }

  gameOver() {
    clearInterval(this.gameLoop);
    const isHighScore = this.leaderboard.isHighScore(this.score);
    this.finalScoreElement.textContent = `Score: ${this.score}${isHighScore ? ' 🎉 New High Score!' : ''}`;
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

new SnakeGame();
