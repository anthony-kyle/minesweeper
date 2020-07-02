document.addEventListener('DOMContentLoaded', startGame)
// Define your `board` object here!
var board = {
  cells: [] // cells[]
}; // board{}

var leftButtonDown = false;
var rightButtonDown = false;
var double = false;
var blockLeft = false;
var blockRight = false;
var gameLevel = 6;

function generateBoard(level){
  for (let i = 1; i <= level; i++){
    for (let j = 1; j <= level; j++){
        board.cells.push({
          "row": i,
          "col": j,
          "isMine": false,
          "hidden": true,
          "isMarked": false
        });
    }
  }
  return addMines(level);
}

function addMines(level){
  let maxMines = 0;
  let mineLocations = [];
  let col = 0;
  let row = 0;
  let needle = "";
  let cellInx = 0;

  // Determine maximum number of mines that should be present
  switch(level){
    case 2:
      maxMines = 2;
      break;
    case 3:
      maxMines = 3;
      break;
    case 4:
      maxMines = 5;
      break;
    case 5:
      maxMines = 9;
      break;
    case 6:
      maxMines = 12;
      break;
  }

  // Allocate Mines to board
  for(let i = 0; i < maxMines; i++){
    col = Math.ceil(Math.random() * level);
    row = Math.ceil(Math.random() * level);
    needle = col + ":" + row;
    if (mineLocations.indexOf(needle) > -1) {
      i--;
    } else {
      cellInx = getThisCellIndex(col, row);
      board.cells[cellInx].isMine = true;
      mineLocations.push(needle);
    }
  }
  return maxMines;
}

function getThisCellIndex(col, row){
  return row * gameLevel + col - gameLevel -1;
}

function showMineCount(mineCount){
  if (mineCount < 0){
    document.getElementById("notes").innerHTML = '<span class="warn">' + mineCount + ' Marks Remaining</span>';
  } else {
    document.getElementById("notes").innerHTML = mineCount + " Marks Remaining";
  }
  
}

function startGame () {
  mineCount = generateBoard(gameLevel);
  showMineCount(mineCount);


  board.cells.forEach(cell => {
    cell.surroundingMines = countSurroundingMines(cell);
  }); // ForEach
  // Add Event Listeners
  document.addEventListener('mousedown', checkClick);
  document.addEventListener('mouseup', checkClick);
  document.getElementById('reset').addEventListener('click', resetGame);

  // Don't remove this function call: it makes the game work!
  lib.initBoard()
}

function checkClick(evt){
  let timer;
  if (evt.buttons == 3 && evt.type == 'mousedown' && double == false){
    hint(evt);
    double = true;
  } else if (evt.type == 'mouseup' && double == true){
    showUnmarked(evt);
    double=false;
    blockLeft = true;
    blockRight = true;
  } else if (evt.buttons == 1 && double == false){
    if (blockLeft != true) checkForWin(evt);
    else blockRight = false;
  } else if (evt.buttons == 2 && double == false){
    if (blockRight != true)checkForWin(evt);
    else blockRight = false;
  }
}

function getCell(evt){
  let row = parseInt(evt.target.classList[0].substr(4));
  let col = parseInt(evt.target.classList[1].substr(4));
  let idx = getThisCellIndex(col, row);
  return board.cells[idx];
}

function hint(evt){
  let cell = getCell(evt);
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  surrounding.forEach(surrCell => {
    if (surrCell.isMarked == false){
      toggleIndication(surrCell);
    }
  })
}

function showUnmarked(evt){
  let count = 0;
  let cell = getCell(evt);
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  surrounding.forEach(cellCount =>{
    if(cellCount.isMarked) count++;
    toggleIndication(cellCount);
  });
  if (count == cell.surroundingMines){
    surrounding.forEach(surrCell => {
      if (surrCell.isMarked == false){
        showThisCell(surrCell, evt);
      }
    });
  }
}

function showThisCell (cell, evt) {
  cell.hidden = false;
  cell.isMarked = false;
  let cellClass = "row-" + cell.row + " col-" + cell.col;
  let currCell = document.getElementsByClassName(cellClass)[0];
  currCell.classList.remove('hidden');
  currCell.classList.remove('marked');
  if (cell.isMine == true) {
    displayMessage('BOOM!')
    revealMines()
    removeListeners()
    return
  }
  setInnerHTML(cell)
  if (cell.surroundingMines === 0) {
    showSurrounding(evt.target)
  }
}

function toggleIndication(cell) {
  if (cell.isMarked == false && cell.hidden == true){
    let cellClass = "row-" + cell.row + " col-" + cell.col;
    let currCell = document.getElementsByClassName(cellClass)[0]; 
    currCell.classList.toggle('indicated')
  }
}
// Define this function to look for a win condition:
//
// 1. Are all of the cells that are NOT mines visible?
// 2. Are all of the mines marked?
function checkForWin (evt) {
  console.log(evt);
  // I chose to change the logic for the win condition, 
  // as the goal is to successfully clear any non mined area
  // and some players choose not to mark the mines, there would be
  // no win condition, in that case. 
  // Instead I validate if all non mine cells have been discovered
  // for a win condition

  let count = 0;
  let passCondition = false;

  board.cells.forEach(cell => {
    if (passCondition == true) return;
    // If Any non Mine Cell is not hidden Pass
    if (cell.isMine == false && cell.hidden == true) {
      passCondition = true;
    };
  })  
  if (passCondition == true) return;    
  board.cells.forEach(cell => {
    if (cell.isMine == true){
      markOnWin(cell);
    }
  })
  lib.displayMessage('You win!');
} // checkForWin()

// function revealCell(row, col){
//   let mineClass = "row-" + cell.row + " col-" + cell.col;
//   let mine = document.getElementsByClassName(mineClass);
//   mine[0].classList.remove("hidden");
// }

function markOnWin(cell){
  // Mark all mines on win!
  let mineClass = "row-" + cell.row + " col-" + cell.col;
  let mine = document.getElementsByClassName(mineClass);
  
  mine[0].classList.add('mine');
  mine[0].classList.add('win');
  mine[0].classList.remove("hidden");
  mine[0].classList.remove("marked");

}
// Define this function to count the number of mines around the cell
// (there could be as many as 8). You don't have to get the surrounding
// cells yourself! Just use `lib.getSurroundingCells`: 
//
//   var surrounding = lib.getSurroundingCells(cell.row, cell.col)
//
// It will return cell objects in an array. You should loop through 
// them, counting the number of times `cell.isMine` is true.
function countSurroundingMines (cell) {
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  let count=0;
  surrounding.forEach(mine => {
    if (mine.isMine) count++;
  });
  return count;
}

// Function to reset game
function resetGame(){
  board.cells = [];
  document.getElementsByClassName('board')[0].innerHTML = " ";
  startGame();
}