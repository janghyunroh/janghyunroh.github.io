// Firebase Leaderboard Utility
// Replace these with your Firebase config after setting up your project
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

class Leaderboard {
  constructor(gameId) {
    this.gameId = gameId;
    this.db = null;
    this.isFirebaseConfigured = false;
    this.checkFirebaseConfig();
  }

  checkFirebaseConfig() {
    // Check if Firebase is configured
    this.isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

    if (this.isFirebaseConfigured && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.db = firebase.database();
      } catch (error) {
        console.error('Firebase initialization error:', error);
        this.isFirebaseConfigured = false;
      }
    }
  }

  async submitScore(playerName, score, additionalData = {}) {
    if (!this.isFirebaseConfigured) {
      console.warn('Firebase not configured. Score saved locally only.');
      this.saveLocalScore(playerName, score, additionalData);
      return false;
    }

    try {
      const scoreData = {
        name: playerName.substring(0, 20), // Limit name length
        score: score,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        ...additionalData
      };

      await this.db.ref(`leaderboards/${this.gameId}`).push(scoreData);
      this.saveLocalScore(playerName, score, additionalData);
      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      this.saveLocalScore(playerName, score, additionalData);
      return false;
    }
  }

  async getTopScores(limit = 10) {
    if (!this.isFirebaseConfigured) {
      return this.getLocalTopScores(limit);
    }

    try {
      const snapshot = await this.db.ref(`leaderboards/${this.gameId}`)
        .orderByChild('score')
        .limitToLast(limit)
        .once('value');

      const scores = [];
      snapshot.forEach((child) => {
        scores.push(child.val());
      });

      // Sort in descending order
      return scores.reverse();
    } catch (error) {
      console.error('Error getting top scores:', error);
      return this.getLocalTopScores(limit);
    }
  }

  saveLocalScore(playerName, score, additionalData = {}) {
    const localKey = `leaderboard_${this.gameId}`;
    let scores = JSON.parse(localStorage.getItem(localKey) || '[]');

    scores.push({
      name: playerName,
      score: score,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      ...additionalData
    });

    // Keep only top 100 scores locally
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 100);

    localStorage.setItem(localKey, JSON.stringify(scores));
  }

  getLocalTopScores(limit = 10) {
    const localKey = `leaderboard_${this.gameId}`;
    const scores = JSON.parse(localStorage.getItem(localKey) || '[]');
    return scores.slice(0, limit);
  }

  getPersonalBest() {
    const localKey = `leaderboard_${this.gameId}`;
    const scores = JSON.parse(localStorage.getItem(localKey) || '[]');
    return scores.length > 0 ? scores[0].score : 0;
  }

  isHighScore(score) {
    const personalBest = this.getPersonalBest();
    return score > personalBest;
  }
}

// Leaderboard UI Component
class LeaderboardUI {
  constructor(leaderboard, containerId) {
    this.leaderboard = leaderboard;
    this.container = document.getElementById(containerId);
    this.isVisible = false;
  }

  async show() {
    this.isVisible = true;
    const scores = await this.leaderboard.getTopScores(10);
    this.render(scores);
    this.container.classList.remove('hidden');
  }

  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  render(scores) {
    const personalBest = this.leaderboard.getPersonalBest();
    const isFirebase = this.leaderboard.isFirebaseConfigured;

    let html = `
      <div class="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <button class="close-leaderboard">×</button>
      </div>
      ${!isFirebase ? '<div class="leaderboard-notice">⚠️ Local scores only. Configure Firebase for global leaderboard.</div>' : ''}
      <div class="leaderboard-personal-best">
        Your Best: <strong>${personalBest}</strong>
      </div>
      <div class="leaderboard-list">
    `;

    if (scores.length === 0) {
      html += '<div class="no-scores">No scores yet. Be the first!</div>';
    } else {
      html += '<ol>';
      scores.forEach((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const date = new Date(score.date || score.timestamp).toLocaleDateString();
        html += `
          <li class="leaderboard-item rank-${index + 1}">
            <span class="rank">${medal || (index + 1)}</span>
            <span class="name">${this.escapeHtml(score.name)}</span>
            <span class="score">${score.score}</span>
            <span class="date">${date}</span>
          </li>
        `;
      });
      html += '</ol>';
    }

    html += `
      </div>
      <div class="leaderboard-footer">
        <button class="refresh-leaderboard">🔄 Refresh</button>
      </div>
    `;

    this.container.innerHTML = html;

    // Add event listeners
    this.container.querySelector('.close-leaderboard').addEventListener('click', () => this.hide());
    this.container.querySelector('.refresh-leaderboard').addEventListener('click', () => this.show());
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async promptForName() {
    return new Promise((resolve) => {
      const name = prompt('Enter your name for the leaderboard:', localStorage.getItem('playerName') || 'Anonymous');
      if (name && name.trim()) {
        localStorage.setItem('playerName', name.trim());
        resolve(name.trim());
      } else {
        resolve('Anonymous');
      }
    });
  }
}
