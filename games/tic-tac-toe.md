---
layout: game
title: Tic-Tac-Toe
permalink: /games/tic-tac-toe/
---

<div class="tic-tac-toe-game">
  <h1>Tic-Tac-Toe</h1>

  <div class="game-info">
    <div class="status">Player X's turn</div>
    <button class="reset-button">New Game</button>
  </div>

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
</div>

<link rel="stylesheet" href="{{ '/assets/css/games/tic-tac-toe.css' | relative_url }}">
<script src="{{ '/assets/js/games/tic-tac-toe.js' | relative_url }}"></script>
