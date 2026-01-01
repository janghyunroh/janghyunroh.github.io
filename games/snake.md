---
layout: game
title: Snake
permalink: /games/snake/
---

<div class="snake-game">
  <h1>Snake</h1>

  <div class="game-info">
    <div class="score-container">
      <div class="score-label">Score</div>
      <div class="score">0</div>
    </div>
    <button class="leaderboard-button">🏆 Leaderboard</button>
    <button class="reset-button">New Game</button>
  </div>

  <div class="instructions">
    Use arrow keys (↑ ↓ ← →) to control the snake. Eat the food to grow longer!
  </div>

  <canvas id="snakeCanvas" width="400" height="400"></canvas>

  <div class="game-message hidden">
    <p>Game Over!</p>
    <p class="final-score"></p>
    <div class="game-message-buttons">
      <button class="submit-score-button">📝 Submit Score</button>
      <button class="retry-button">Try again</button>
    </div>
  </div>

  <div id="leaderboard-modal" class="leaderboard-container hidden"></div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/games/snake.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/leaderboard.css' | relative_url }}">
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="{{ '/assets/js/leaderboard.js' | relative_url }}"></script>
<script src="{{ '/assets/js/games/snake.js' | relative_url }}"></script>
