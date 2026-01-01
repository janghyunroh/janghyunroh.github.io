---
layout: game
title: Memory Card
permalink: /games/memory-card/
---

<div class="memory-card-game">
  <h1>Memory Card Game</h1>

  <div class="game-info">
    <div class="score-container">
      <div class="score-label">Moves</div>
      <div class="moves">0</div>
    </div>
    <div class="score-container">
      <div class="score-label">Pairs</div>
      <div class="pairs">0 / 8</div>
    </div>
    <button class="reset-button">New Game</button>
  </div>

  <div class="instructions">
    Click on cards to flip them. Match all pairs with the fewest moves!
  </div>

  <div class="card-grid"></div>

  <div class="game-message hidden">
    <p>Congratulations! 🎉</p>
    <p class="final-moves"></p>
    <button class="retry-button">Play again</button>
  </div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/games/memory-card.css' | relative_url }}">
<script src="{{ '/assets/js/games/memory-card.js' | relative_url }}"></script>
