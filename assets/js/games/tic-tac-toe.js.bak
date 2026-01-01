const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const statusElement = document.querySelector('.status');
const resetButton = document.querySelector('.reset-button');
let oTurn;

startGame();

resetButton.addEventListener('click', startGame);

function startGame() {
  oTurn = false;
  cellElements.forEach(cell => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(O_CLASS);
    cell.classList.remove('winner');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });
  setStatusText();
}

function handleClick(e) {
  const cell = e.target;
  const currentClass = oTurn ? O_CLASS : X_CLASS;
  placeMark(cell, currentClass);
  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    swapTurns();
    setStatusText();
  }
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  oTurn = !oTurn;
}

function setStatusText() {
  statusElement.textContent = `Player ${oTurn ? 'O' : 'X'}'s turn`;
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some(combination => {
    const isWin = combination.every(index => {
      return cellElements[index].classList.contains(currentClass);
    });
    if (isWin) {
      combination.forEach(index => {
        cellElements[index].classList.add('winner');
      });
    }
    return isWin;
  });
}

function isDraw() {
  return [...cellElements].every(cell => {
    return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
  });
}

function endGame(draw) {
  if (draw) {
    statusElement.textContent = "It's a Draw!";
  } else {
    statusElement.textContent = `Player ${oTurn ? 'O' : 'X'} Wins!`;
  }
}
