---
layout: game
title: Tic-Tac-Toe
permalink: /games/tic-tac-toe/
---

<div class="tic-tac-toe-game">
  <h1>Tic-Tac-Toe</h1>

  <!-- Mode Selection -->
  <div class="mode-selection">
    <button class="mode-btn active" data-mode="local">Local Play</button>
    <button class="mode-btn" data-mode="online">Online Play</button>
  </div>

  <!-- Online Lobby (hidden by default) -->
  <div class="online-lobby hidden">
    <div class="lobby-info">
      <div class="online-status">
        <span class="status-indicator"></span>
        <span class="online-count">0 players online</span>
      </div>
      <div class="player-info">
        <input type="text" class="player-name-input" placeholder="Enter your name" maxlength="15">
      </div>
    </div>
    <button class="find-match-btn">Find Match</button>
    <div class="matchmaking-status hidden">
      <div class="spinner"></div>
      <p>Searching for opponent...</p>
      <button class="cancel-match-btn">Cancel</button>
    </div>
  </div>

  <!-- Game Info -->
  <div class="game-info">
    <div class="players-display hidden">
      <div class="player-x">
        <span class="player-symbol">X</span>
        <span class="player-name">You</span>
      </div>
      <div class="player-o">
        <span class="player-symbol">O</span>
        <span class="player-name">Opponent</span>
      </div>
    </div>
    <div class="status">Player X's turn</div>
    <button class="reset-button">New Game</button>
  </div>

  <!-- Game Board -->
  <div class="board">
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
    <div class="cell" data-cell></div>
  </div>

  <!-- Game Result Modal -->
  <div class="game-result-modal hidden">
    <div class="result-content">
      <h2 class="result-title"></h2>
      <p class="result-message"></p>
      <div class="result-buttons">
        <button class="rematch-btn">Rematch</button>
        <button class="new-match-btn">Find New Match</button>
        <button class="back-to-lobby-btn">Back to Lobby</button>
      </div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/games/tic-tac-toe.css' | relative_url }}">
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="{{ '/assets/js/leaderboard.js' | relative_url }}"></script>
<script src="{{ '/assets/js/games/tic-tac-toe.js' | relative_url }}"></script>
