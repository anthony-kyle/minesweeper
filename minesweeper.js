// ***********************************************************
// minesweeper.js
// Author: Anthony McGrath
// Copyright: 07/07/2020
// ***********************************************************

document.addEventListener('DOMContentLoaded', startGame)

//************************************************************* 
// Global Variables
//************************************************************* 

var board = {
  cells: [] // cells[]
}; // board{}

var gameLevel = 4;  // Default Difficulty level. Can be between 2-6
var double = false; // Switch for handling dual click
var activeCell;     // Placeholder for storing current active cell on dual click
// End Globals

//************************************************************* 
// Game board generation
//************************************************************* 

function startGame () {
  // Perform game initialisation
  mineCount = generateBoard(gameLevel);     // Generate game board return # mines
  showMineCount(mineCount);                 // Update flag count

  board.cells.forEach(cell => {             // Populate cell mine count
    cell.surroundingMines = countSurroundingMines(cell);
  }); // ForEach

  // Don't remove this function call: it makes the game work!
  lib.initBoard()

  // Add global Event Listeners
  document.addEventListener('keydown', validateKeyPress);
  document.getElementById('reset').addEventListener('click', resetGame);
  document.getElementById('easier').addEventListener('click', changeDifficulty);
  document.getElementById('harder').addEventListener('click', changeDifficulty);
  document.getElementById('showInstructions').addEventListener('click', toggleInstructions);
  document.getElementById('hideInstructions').addEventListener('click', toggleInstructions);
  
  // Add game play listeners
  addGameListeners(); 
} // startGame()

// Function to reset game
function resetGame(){
  board.cells = [];
  document.getElementsByClassName('board')[0].innerHTML = " ";
  startGame();
} // resetGame()

function countSurroundingMines(cell) {
  // Count surrounding mines 
  // Update cell object
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  let count=0;
  surrounding.forEach(mine => {
    if (mine.isMine) count++;
  }); // foreach
  return count;
} // countSurroundingMines(cell)

function getBoardChildren(){
  return document.getElementsByClassName('board')[0];
} // getBoardChildren()

function addGameListeners(){
  let gameBoard = getBoardChildren();
  for (let i = 0; i < gameBoard.children.length; i++){
    gameBoard.children[i].addEventListener('mousedown', checkClick);
    gameBoard.children[i].addEventListener('mouseup', checkClick);
  } // for
} // addGameListeners()

function removeGameListeners(){
  let gameBoard = getBoardChildren();
  for (let i = 0; i < gameBoard.children.length; i++){
    gameBoard.children[i].removeEventListener('mousedown', checkClick);
    gameBoard.children[i].removeEventListener('mouseup', checkClick);
  } // for
} // removeGameListeners

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
    } // for column
  } // for row
  return addMines(level);
} // generateBoard(level)

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
      maxMines = 1;
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
  } // Switch(level)

  // Allocate Mines to board
  for(let i = 0; i < maxMines; i++){
    col = Math.ceil(Math.random() * level);
    row = Math.ceil(Math.random() * level);
    needle = col + ":" + row;
    if (mineLocations.indexOf(needle) > -1) {
      i--; // Pretend loop never happened if mine exists already
    } else {
      cellInx = getThisCellIndex(col, row);
      board.cells[cellInx].isMine = true;
      mineLocations.push(needle);
    } // if
  } // for
  return maxMines;
} // addMines(level)

function getThisCellIndex(col, row){
  return row * gameLevel + col - gameLevel -1;
} // getThisCellIndex(col, row)

function showMineCount(mineCount){
  if (mineCount < 0){
    document.getElementById("notes").innerHTML = '<p class="warn"><img src="images/redflag.png" alt="marks" class="hint"> = ' + mineCount + '</p>';
  } else {
    document.getElementById("notes").innerHTML = '<p class="hint"><img src="images/flag.png" alt="marks" class="hint"> = ' + mineCount + '</p>';
  } // if-else
} // showMineCount(mineCount)


//************************************************************* 
// Key Presses / Associated Functions
//************************************************************* 

function validateKeyPress(evt){
  // Process Key Presses 
  if (evt.key == "F2") resetGame();
  if (evt.key == "i") toggleInstructions();
  if (evt.key == "-" || evt.key == "_" || evt.key == "+" || evt.key == "=") changeDifficulty(evt);
}

function changeDifficulty(evt){
  if (evt.target.id == "easier" || evt.key == "-" || evt.key == "_"){
    // Reduce Game Level
    if (gameLevel > 2) {
      gameLevel--;
    } else {
      alert("It can't go any easier, there's only 1 bomb!");
    } // if-else
  } else if (evt.target.id == "harder" || evt.key == "+" || evt.key == "=") {
    // Increase Game Level
    if (gameLevel < 6) {
      gameLevel++;
    } else {
      alert("You're too good for me!");
    } // if-else
  } // if-elseif
  resetGame();
} // changeDifficulty(evt)

//************************************************************* 
// Mouse Clicks / Associated Functions
//************************************************************* 

function checkClick(evt){
  // Handle dual click
  if (evt.buttons == 3 && evt.type == 'mousedown' && double == false) {
    // Both mouse buttons down, indicate surrounding cells
    double = true;
    hint(evt);
  } else if (evt.type == 'mouseup' && double == true) {
    // Both mouse buttons up, process reveal
    double = false;
    showUnmarked(evt);
    checkForWin(evt);
  } // if-elseif
}

function showUnmarked(evt){
  let count = 0;
  let cell = activeCell;
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  surrounding.forEach(cellCount =>{
    if(cellCount.isMarked) count++;
    toggleIndication(cellCount, evt);
  });
  if (count == cell.surroundingMines){
    surrounding.forEach(surrCell => {
      if (surrCell.isMarked == false){
        showThisCell(surrCell, evt);
      }
    });
  }
}

function hint(evt){
  // Store event cell to handle pending mouseup event later on
  activeCell = getCell(evt); 

  // indicate surrounding hidden cells on dual click with class
  let cell = activeCell;
  let surrounding = lib.getSurroundingCells(cell.row, cell.col);
  surrounding.forEach(surrCell => {
    if (surrCell.isMarked == false){
      toggleIndication(surrCell, evt);
    } // if
  }) // forEach(surrCell)
} // hint(evt)

function toggleIndication(cell, evt) {
  // Add / Remove class indicated on specified cell
  if (cell.isMarked == false && cell.hidden == true){
    let cellClass = "msRow-" + cell.row + " msCol-" + cell.col;
    let currCell = document.getElementsByClassName(cellClass)[0]; 
    if (evt.type == 'mousedown'){
      currCell.classList.add('indicated')
    } else if (evt.type == 'mouseup'){
      currCell.classList.remove('indicated')
    } // if-elseif
  } // if
} // toggleIndication(cell, evt)

// function to play sounds
function playAudio(id){
  document.getElementById(id).play();
} // playAudio(id)

//************************************************************* 
// Cell Functions
//************************************************************* 

function getCell(evt){
  // Return the clicked cell's object
  let row = parseInt(evt.target.classList[0].substr(6));
  let col = parseInt(evt.target.classList[1].substr(6));
  let idx = getThisCellIndex(col, row);
  return board.cells[idx];
} // getCell(evt)

function showThisCell (cell, evt) {
  // Update Cell Properties
  cell.hidden = false;
  cell.isMarked = false;

  // Find DOM object based on row / col class
  let cellClass = "msRow-" + cell.row + " msCol-" + cell.col;
  let currCell = document.getElementsByClassName(cellClass)[0];

  // Update DOM Object class
  currCell.classList.remove('hidden');
  currCell.classList.remove('marked');

  // handle if cell is a mine / select audio cue
  if (cell.isMine == true) {
    playAudio('bomb');
    displayMessage('BOOM!');
    revealMines(evt);
    removeGameListeners();
    return;
  } else {
    playAudio('click');
  } // if-else

  // Update cell contents
  setInnerHTML(cell)
  if (cell.surroundingMines === 0) {
    showSurrounding(evt.target)
  } // if
} // showThisCell(cell, evt)

function checkForWin () {
  // Check current board state
  // evaluate win condition not met
  // Win conditions: 
  //  - All non mine cells revealed
  //  - Mines do not need to be marked

  let loseCondition = false;

  board.cells.forEach(cell => {
    if (loseCondition == true) return;
    // If Any non Mine Cell is not hidden Pass
    if (cell.isMine == false && cell.hidden == true) {
      loseCondition = true;
    };
  }) // forEach 
  if (loseCondition == true) return;

  // No lose condition found, game won.
  board.cells.forEach(cell => {
    if (cell.isMine == true){
      markOnWin(cell);
    }
  })
  lib.displayMessage('You win!');
  playAudio('win');
} // checkForWin()

function markOnWin(cell){
  // Mark all mines on win!
  let mineClass = "msRow-" + cell.row + " msCol-" + cell.col;
  let mine = document.getElementsByClassName(mineClass);
  
  mine[0].classList.add('mine');
  mine[0].classList.add('win');
  mine[0].classList.remove("hidden");
  mine[0].classList.remove("marked");
} // checkForWin()

//************************************************************* 
// Help Functions
//************************************************************* 
function toggleInstructions(){
  var instructions = document.getElementById('instructions');
  if (instructions.style.display === "none"){
    instructions.style.display = "block";
  } else {
    instructions.style.display = "none";
  }
} // toggleInstructions()
