---
layout: game
title: Tetris
permalink: /games/tetris/
---

<div class="tetris-game">
  <h1>Tetris</h1>

  <div class="game-info">
    <div class="score-container">
      <div class="score-label">Score</div>
      <div class="score">0</div>
    </div>
    <div class="score-container">
      <div class="score-label">Lines</div>
      <div class="lines">0</div>
    </div>
    <button class="leaderboard-button">🏆 Leaderboard</button>
    <button class="reset-button">New Game</button>
  </div>

  <div class="instructions">
    Use arrow keys: ← → to move, ↓ to drop faster, ↑ to rotate. Space to instant drop. C or Shift to hold.
  </div>

  <div class="game-container">
    <div class="hold-piece">
      <h3>Hold</h3>
      <canvas id="holdCanvas" width="100" height="100"></canvas>
    </div>
    <canvas id="tetrisCanvas" width="300" height="600"></canvas>
    <div class="next-pieces">
      <h3>Next</h3>
      <canvas id="next1Canvas" width="100" height="80"></canvas>
      <canvas id="next2Canvas" width="100" height="80"></canvas>
      <canvas id="next3Canvas" width="100" height="80"></canvas>
      <canvas id="next4Canvas" width="100" height="80"></canvas>
      <canvas id="next5Canvas" width="100" height="80"></canvas>
    </div>
  </div>

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

<link rel="stylesheet" href="{{ '/assets/css/games/tetris.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/leaderboard.css' | relative_url }}">
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="{{ '/assets/js/leaderboard.js' | relative_url }}"></script>
<script src="{{ '/assets/js/games/tetris.js' | relative_url }}"></script>
