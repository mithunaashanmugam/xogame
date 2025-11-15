// projects/tic-tac-toe/script.js
document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const statusTurn = document.getElementById('turn');
  const messageEl = document.getElementById('message');
  const restartBtn = document.getElementById('restart');
  const clearScoresBtn = document.getElementById('clear-scores');
  const scoreX = document.getElementById('score-x');
  const scoreO = document.getElementById('score-o');

  // Defensive checks
  if (!boardEl || cells.length !== 9) {
    console.error('TicTacToe: missing DOM elements or incorrect number of cells');
    return;
  }

  // Game state
  let currentPlayer = 'X';
  let board = Array(9).fill(null);
  let isGameOver = false;

  // Score persistence key
  const SCORE_KEY = 'ttt-scores-v1';

  function loadScores() {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (!raw) return { X: 0, O: 0 };
      const parsed = JSON.parse(raw);
      return { X: parsed.X || 0, O: parsed.O || 0 };
    } catch (e) {
      console.error('Failed to load scores', e);
      return { X: 0, O: 0 };
    }
  }

  function saveScores(s) {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(s));
    } catch (e) {
      console.error('Failed to save scores', e);
    }
  }

  let scores = loadScores();

  // Helpers
  const setMessage = (txt) => { if (messageEl) messageEl.textContent = (txt || ''); };
  const updateTurnUI = () => { if (statusTurn) statusTurn.textContent = currentPlayer; };
  const updateScoreUI = () => {
    if (scoreX) scoreX.textContent = scores.X;
    if (scoreO) scoreO.textContent = scores.O;
  };

  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWin(bd) {
    for (const combo of WIN_COMBOS) {
      const [a,b,c] = combo;
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
        return { winner: bd[a], combo };
      }
    }
    return null;
  }

  function isDraw(bd) {
    return bd.every(cell => cell !== null);
  }

  function placeMark(index) {
    if (isGameOver) return;
    if (board[index]) return;

    board[index] = currentPlayer;
    const cell = cells[index];
    cell.classList.add(currentPlayer.toLowerCase());
    cell.textContent = currentPlayer;

    const result = checkWin(board);
    if (result) {
      isGameOver = true;
      // highlight winning cells
      result.combo.forEach(i => {
        const c = cells[i];
        if (c) c.classList.add('win');
      });
      setMessage(`${result.winner} wins!`);
      // update and persist score
      scores[result.winner] = (scores[result.winner] || 0) + 1;
      saveScores(scores);
      updateScoreUI();
      return;
    }

    if (isDraw(board)) {
      isGameOver = true;
      setMessage('Draw');
      return;
    }

    // alternate
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnUI();
    setMessage('');
  }

  // Wire cells
  cells.forEach((cell) => {
    const idx = Number(cell.dataset.cell);
    cell.addEventListener('click', () => placeMark(idx));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        placeMark(idx);
      }
    });
  });

  // Robust restart: always reset flags, board array, UI classes and text
  function restartGame() {
    // reset state
    board = Array(9).fill(null);
    isGameOver = false;
    currentPlayer = 'X';
    updateTurnUI();
    setMessage('');

    // explicit UI reset using a standard loop (avoid arrow-comma pitfalls)
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      c.textContent = '';
      c.classList.remove('x', 'o', 'win');
      // ensure cell is not disabled (if you disable them elsewhere)
      if (c.hasAttribute('disabled')) c.removeAttribute('disabled');
    }
  }

  if (restartBtn) restartBtn.addEventListener('click', restartGame);

  // Clear Scores — reset, persist, update UI
  if (clearScoresBtn) {
    clearScoresBtn.addEventListener('click', () => {
      scores = { X: 0, O: 0 };
      try {
        localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
      } catch (e) {
        console.error('Failed to clear scores', e);
      }
      updateScoreUI();
      setMessage('Scores cleared');
    });
  }

  // Init UI
  updateTurnUI();
  updateScoreUI();
  setMessage('Click a cell to start');

  // Debug helpers
  window.__ttt = {
    getBoard: () => board.slice(),
    restart: restartGame,
    getScores: () => ({ ...scores }),
    clearScores: () => { if (clearScoresBtn) clearScoresBtn.click(); }
  };
});
