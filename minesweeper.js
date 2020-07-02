document.addEventListener('DOMContentLoaded', startGame)

// Define your `board` object here!
var board = {
  cells: [
    {
      "row"     : 0,
      "col"     : 0,
      "isMine"  : true,
      "hidden"  : true
    }, // Cell 1
    {
      "row"     : 0,
      "col"     : 1,
      "isMine"  : true,
      "hidden"  : true
    }, // Cell 2
    {
      "row"     : 1,
      "col"     : 0,
      "isMine"  : false,
      "hidden"  : true
    }, // Cell 3
    {
      "row"     : 1,
      "col"     : 1,
      "isMine"  : false,
      "hidden"  : true
    } // Cell 4
  ] // cells[]
}; // board{}

function startGame () {
  board.cells.forEach(cell => {
    cell.surroundingMines = countSurroundingMines(cell);
  }); // ForEach
  // Add Event Listeners
  document.addEventListener('click', checkForWin, false);
  document.addEventListener('contextmenu', checkForWin, false);

  // Don't remove this function call: it makes the game work!
  lib.initBoard()
}

// Define this function to look for a win condition:
//
// 1. Are all of the cells that are NOT mines visible?
// 2. Are all of the mines marked?
function checkForWin () {
  // I chose to change the logic for the win condition, 
  // as the goal is to successfully clear any non mined area
  // and some players choose not to mark the mines, there would be
  // no win condition, in that case. 
  // Instead I validate if all non mine cells have been discovered
  // for a win condition
  console.log(new Error().stack);

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


function markOnWin(cell){
  // Mark all mines on win!
  let mineClass = "row-" + cell.row + " col-" + cell.col;
  let mine = document.getElementsByClassName(mineClass);
  mine[0].classList.toggle('marked');

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

