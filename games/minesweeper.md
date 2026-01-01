---
layout: game
title: Minesweeper
permalink: /games/minesweeper/
---

<div class="minesweeper-game">
  <h1>Minesweeper</h1>

  <div class="game-info">
    <div class="score-container">
      <div class="score-label">Mines</div>
      <div class="mines-count">10</div>
    </div>
    <div class="score-container">
      <div class="score-label">Time</div>
      <div class="timer">0</div>
    </div>
    <button class="leaderboard-button">🏆 Leaderboard</button>
    <button class="reset-button">New Game</button>
  </div>

  <div class="difficulty-selector">
    <button class="difficulty-btn active" data-difficulty="easy">Easy (8x8, 10 mines)</button>
    <button class="difficulty-btn" data-difficulty="medium">Medium (16x16, 40 mines)</button>
    <button class="difficulty-btn" data-difficulty="hard">Hard (16x30, 99 mines)</button>
  </div>

  <div class="instructions">
    Left click to reveal. Right click to flag/unflag a mine. Clear all non-mine cells to win!
  </div>

  <div class="board-container">
    <div class="board"></div>
  </div>

  <div class="game-message hidden">
    <p class="message-text"></p>
    <p class="final-time"></p>
    <div class="game-message-buttons">
      <button class="submit-score-button">📝 Submit Score</button>
      <button class="retry-button">Try again</button>
    </div>
  </div>

  <div id="leaderboard-modal" class="leaderboard-container hidden"></div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/games/minesweeper.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/leaderboard.css' | relative_url }}">
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="{{ '/assets/js/leaderboard.js' | relative_url }}"></script>
<script src="{{ '/assets/js/games/minesweeper.js' | relative_url }}"></script>
