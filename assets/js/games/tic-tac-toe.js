// Tic-Tac-Toe with Online Matchmaking
const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

class TicTacToeGame {
  constructor() {
    this.cellElements = document.querySelectorAll('[data-cell]');
    this.statusElement = document.querySelector('.status');
    this.resetButton = document.querySelector('.reset-button');
    this.modeButtons = document.querySelectorAll('.mode-btn');
    this.onlineLobby = document.querySelector('.online-lobby');
    this.playersDisplay = document.querySelector('.players-display');
    this.findMatchBtn = document.querySelector('.find-match-btn');
    this.cancelMatchBtn = document.querySelector('.cancel-match-btn');
    this.matchmakingStatus = document.querySelector('.matchmaking-status');
    this.playerNameInput = document.querySelector('.player-name-input');
    this.onlineCountElement = document.querySelector('.online-count');
    this.resultModal = document.querySelector('.game-result-modal');
    this.resultTitle = document.querySelector('.result-title');
    this.resultMessage = document.querySelector('.result-message');
    this.rematchBtn = document.querySelector('.rematch-btn');
    this.newMatchBtn = document.querySelector('.new-match-btn');
    this.backToLobbyBtn = document.querySelector('.back-to-lobby-btn');

    this.mode = 'local';
    this.oTurn = false;
    this.gameActive = false;
    
    this.db = null;
    this.isFirebaseConfigured = false;
    this.playerId = null;
    this.playerName = '';
    this.currentGameId = null;
    this.mySymbol = null;
    this.gameRef = null;
    this.presenceRef = null;
    this.queueRef = null;
    this.onlinePlayersRef = null;

    this.initFirebase();
    this.initEventListeners();
    this.loadPlayerName();
    this.startGame();
  }

  initFirebase() {
    if (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY') {
      if (typeof firebase !== 'undefined') {
        try {
          if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
          }
          this.db = firebase.database();
          this.isFirebaseConfigured = true;
          this.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          console.log('Firebase initialized for online play');
        } catch (error) {
          console.error('Firebase initialization error:', error);
          this.isFirebaseConfigured = false;
        }
      }
    }
  }

  initEventListeners() {
    this.resetButton.addEventListener('click', () => this.handleReset());
    
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
    });

    this.findMatchBtn.addEventListener('click', () => this.findMatch());
    this.cancelMatchBtn.addEventListener('click', () => this.cancelMatchmaking());
    
    this.playerNameInput.addEventListener('input', () => {
      this.playerName = this.playerNameInput.value.trim();
      localStorage.setItem('ttt_playerName', this.playerName);
    });

    this.rematchBtn.addEventListener('click', () => this.requestRematch());
    this.newMatchBtn.addEventListener('click', () => this.findNewMatch());
    this.backToLobbyBtn.addEventListener('click', () => this.backToLobby());
  }

  loadPlayerName() {
    const saved = localStorage.getItem('ttt_playerName');
    if (saved) {
      this.playerName = saved;
      this.playerNameInput.value = saved;
    }
  }

  switchMode(mode) {
    this.mode = mode;
    this.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'online') {
      if (!this.isFirebaseConfigured) {
        alert('Firebase is not configured. Online play is not available.');
        this.switchMode('local');
        return;
      }
      this.onlineLobby.classList.remove('hidden');
      this.playersDisplay.classList.add('hidden');
      this.resetButton.classList.add('hidden');
      this.setupOnlinePresence();
    } else {
      this.onlineLobby.classList.add('hidden');
      this.playersDisplay.classList.add('hidden');
      this.resetButton.classList.remove('hidden');
      this.cleanupOnline();
      this.startGame();
    }
  }

  setupOnlinePresence() {
    if (!this.db) return;

    this.onlinePlayersRef = this.db.ref('tictactoe/presence/' + this.playerId);
    this.onlinePlayersRef.set({
      name: this.playerName || 'Anonymous',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    this.onlinePlayersRef.onDisconnect().remove();

    this.db.ref('tictactoe/presence').on('value', snapshot => {
      const count = snapshot.numChildren();
      this.onlineCountElement.textContent = count + ' players online';
    });
  }

  async findMatch() {
    if (!this.playerName) {
      alert('Please enter your name first!');
      this.playerNameInput.focus();
      return;
    }

    this.findMatchBtn.classList.add('hidden');
    this.matchmakingStatus.classList.remove('hidden');

    const queueSnapshot = await this.db.ref('tictactoe/queue').once('value');
    const queue = queueSnapshot.val();

    if (queue) {
      const waitingPlayerId = Object.keys(queue)[0];
      const waitingPlayer = queue[waitingPlayerId];
      
      await this.db.ref('tictactoe/queue/' + waitingPlayerId).remove();
      
      const gameId = 'game_' + Date.now();
      this.currentGameId = gameId;
      this.mySymbol = 'O';
      
      await this.db.ref('tictactoe/games/' + gameId).set({
        playerX: {
          id: waitingPlayerId,
          name: waitingPlayer.name
        },
        playerO: {
          id: this.playerId,
          name: this.playerName
        },
        board: ['', '', '', '', '', '', '', '', ''],
        currentTurn: 'X',
        status: 'active',
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      this.joinGame(gameId);
    } else {
      this.queueRef = this.db.ref('tictactoe/queue/' + this.playerId);
      await this.queueRef.set({
        name: this.playerName,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });

      this.mySymbol = 'X';

      this.db.ref('tictactoe/games').orderByChild('playerX/id').equalTo(this.playerId).on('child_added', snapshot => {
        const gameId = snapshot.key;
        this.currentGameId = gameId;
        if (this.queueRef) {
          this.queueRef.remove();
        }
        this.joinGame(gameId);
      });
    }
  }

  joinGame(gameId) {
    this.matchmakingStatus.classList.add('hidden');
    this.onlineLobby.classList.add('hidden');
    this.playersDisplay.classList.remove('hidden');

    this.gameRef = this.db.ref('tictactoe/games/' + gameId);
    
    this.gameRef.onDisconnect().update({
      status: 'abandoned'
    });

    this.gameRef.on('value', snapshot => {
      const game = snapshot.val();
      if (!game) return;

      this.updateGameUI(game);

      if (game.status === 'finished' || game.status === 'abandoned') {
        this.handleGameEnd(game);
      }
    });

    this.startOnlineGame();
  }

  startOnlineGame() {
    this.gameActive = true;
    this.cellElements.forEach((cell, index) => {
      cell.classList.remove(X_CLASS, O_CLASS, 'winner');
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);
    });
    this.cellElements = document.querySelectorAll('[data-cell]');
    this.cellElements.forEach((cell, index) => {
      cell.addEventListener('click', () => this.handleOnlineClick(index));
    });
  }

  async handleOnlineClick(index) {
    const snapshot = await this.gameRef.once('value');
    const game = snapshot.val();

    if (!game || !game.board) {
      console.error('Invalid game data in handleOnlineClick:', game);
      return;
    }
    if (game.status !== 'active') return;
    if (game.board[index] !== '' && game.board[index] !== null) return;
    if ((this.mySymbol === 'X' && game.currentTurn !== 'X') || (this.mySymbol === 'O' && game.currentTurn !== 'O')) {
      return;
    }

    const newBoard = [...game.board];
    newBoard[index] = this.mySymbol;
    const nextTurn = this.mySymbol === 'X' ? 'O' : 'X';

    const winner = this.checkWinOnline(newBoard);
    const isDraw = newBoard.every(cell => cell !== '' && cell !== null);

    await this.gameRef.update({
      board: newBoard,
      currentTurn: nextTurn,
      status: winner || isDraw ? 'finished' : 'active',
      winner: winner,
      isDraw: isDraw && !winner
    });
  }

  updateGameUI(game) {
    if (!game || !game.board) {
      console.error('Invalid game data:', game);
      return;
    }

    document.querySelector('.player-x .player-name').textContent =
      this.mySymbol === 'X' ? 'You' : game.playerX.name;
    document.querySelector('.player-o .player-name').textContent =
      this.mySymbol === 'O' ? 'You' : game.playerO.name;

    game.board.forEach((cell, index) => {
      const cellElement = this.cellElements[index];
      cellElement.classList.remove(X_CLASS, O_CLASS);
      if (cell) {
        cellElement.classList.add(cell.toLowerCase());
      }
    });

    if (game.status === 'active') {
      const isMyTurn = game.currentTurn === this.mySymbol;
      this.statusElement.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
    }
  }

  checkWinOnline(board) {
    for (let combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  handleGameEnd(game) {
    this.gameActive = false;
    
    let title, message;
    if (game.status === 'abandoned') {
      title = "Game Abandoned";
      message = "Your opponent disconnected.";
    } else if (game.isDraw) {
      title = "Draw";
      message = "Good game!";
    } else if (game.winner === this.mySymbol) {
      title = "You Win!";
      message = "Congratulations!";
    } else {
      title = "You Lose";
      message = "Better luck next time!";
    }

    this.showResultModal(title, message);
  }

  showResultModal(title, message) {
    this.resultTitle.textContent = title;
    this.resultMessage.textContent = message;
    this.resultModal.classList.remove('hidden');
  }

  hideResultModal() {
    this.resultModal.classList.add('hidden');
  }

  requestRematch() {
    this.hideResultModal();
    this.cleanupCurrentGame();
    this.findMatch();
  }

  findNewMatch() {
    this.hideResultModal();
    this.cleanupCurrentGame();
    this.findMatch();
  }

  backToLobby() {
    this.hideResultModal();
    this.cleanupCurrentGame();
    this.onlineLobby.classList.remove('hidden');
    this.playersDisplay.classList.add('hidden');
    this.findMatchBtn.classList.remove('hidden');
  }

  cleanupCurrentGame() {
    if (this.gameRef) {
      this.gameRef.off();
      this.gameRef = null;
    }
    this.currentGameId = null;
    this.mySymbol = null;
    this.cellElements.forEach(cell => {
      cell.classList.remove(X_CLASS, O_CLASS, 'winner');
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);
    });
    this.cellElements = document.querySelectorAll('[data-cell]');
  }

  cancelMatchmaking() {
    if (this.queueRef) {
      this.queueRef.remove();
      this.queueRef = null;
    }
    this.matchmakingStatus.classList.add('hidden');
    this.findMatchBtn.classList.remove('hidden');
  }

  cleanupOnline() {
    if (this.onlinePlayersRef) {
      this.onlinePlayersRef.remove();
      this.onlinePlayersRef = null;
    }
    if (this.queueRef) {
      this.queueRef.remove();
      this.queueRef = null;
    }
    if (this.gameRef) {
      this.gameRef.off();
      this.gameRef = null;
    }
    if (this.db) {
      this.db.ref('tictactoe/presence').off();
    }
  }

  startGame() {
    this.gameActive = true;
    this.oTurn = false;
    this.cellElements.forEach(cell => {
      cell.classList.remove(X_CLASS, O_CLASS, 'winner');
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);
    });
    this.cellElements = document.querySelectorAll('[data-cell]');
    this.cellElements.forEach(cell => {
      cell.addEventListener('click', (e) => this.handleLocalClick(e), { once: true });
    });
    this.setStatusText();
  }

  handleLocalClick(e) {
    if (!this.gameActive) return;
    const cell = e.target;
    const currentClass = this.oTurn ? O_CLASS : X_CLASS;
    this.placeMark(cell, currentClass);
    
    if (this.checkWin(currentClass)) {
      this.endGame(false);
    } else if (this.isDraw()) {
      this.endGame(true);
    } else {
      this.swapTurns();
      this.setStatusText();
    }
  }

  placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
  }

  swapTurns() {
    this.oTurn = !this.oTurn;
  }

  setStatusText() {
    this.statusElement.textContent = 'Player ' + (this.oTurn ? 'O' : 'X') + "'s turn";
  }

  checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
      const isWin = combination.every(index => {
        return this.cellElements[index].classList.contains(currentClass);
      });
      if (isWin) {
        combination.forEach(index => {
          this.cellElements[index].classList.add('winner');
        });
      }
      return isWin;
    });
  }

  isDraw() {
    return [...this.cellElements].every(cell => {
      return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
  }

  endGame(draw) {
    this.gameActive = false;
    if (draw) {
      this.statusElement.textContent = "It's a Draw!";
    } else {
      this.statusElement.textContent = 'Player ' + (this.oTurn ? 'O' : 'X') + ' Wins!';
    }
  }

  handleReset() {
    if (this.mode === 'local') {
      this.startGame();
    }
  }
}

new TicTacToeGame();
