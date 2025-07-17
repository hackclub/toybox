
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function intToChar(int) {
  const code = 'a'.charCodeAt(0);
  return String.fromCharCode(code + int);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


class Piece{
	//initialise
	constructor(id, width, height){
		this.id = id;
    this.width = width;
    this.height = height;
    this.values = [];
	}

}


var cursplit = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
]

var rangen = [
  [1, 2, 3, 4],
  [2, 5, 6, 0],
  [3, 6, 9, 2],
  [4, 0, 2, 7],
]

var choices = [[1, 3], [1, 3], [3, 1], [3, 1],[1, 2], [2, 1]];
var nums = [1, 2, 3, 4, 5, 6, 7];


var today = new Date()
var day = " " + today.getDate() + " " + today.getMonth() + " " + today.getFullYear()


// --- Seeded RNG for Daily Puzzle ---
function mulberry32(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getDailySeed() {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  return parseInt('' + y + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d);
}

var dailySeed = getDailySeed();
var seededRandom = mulberry32(dailySeed);

function seededChoose(choices) {
  var index = Math.floor(seededRandom() * choices.length);
  return choices[index];
}

function seededShuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// yes! the magic generation!
var count = 0;
for (var i = 0; i < 4; i++){
	for (var j = 0; j < 4; j++){
		if (cursplit[i][j] == null){
			var finished = false;
			var ori = seededChoose(choices);
			var ori_width = ori[0];
			var ori_height = ori[1];

			var testc = 0
			while (i + ori_height > 4 || j + ori_width  > 4) {
				ori = seededChoose(choices);
				ori_width = ori[0];
				ori_height = ori[1];
				testc ++;

				if (testc > 10) {
					ori = [1, 1];
					ori_width = 1;
					ori_height = 1;
				}
			}

			for (var k = 0; k < ori_height; k++){
				for (var l = 0; l < ori_width; l++){

					if (cursplit[i+k][j+l] == null) cursplit[i+k][j+l] = count;
					else {
						k = 10; l = 10;
					}
				}
			}

		count ++;
		}
	}
}

// and then the solution numbers
for (var i = 0; i < 4; i++){
	for (var j = i; j < 4; j++){
		rangen[j][i] = rangen[i][j] = seededChoose(nums);
	}
}
console.log(cursplit);
console.log(rangen);



// set up board
var rows = 4;
var cols = 4;

var selected = false;
var curpiece = null;

// current state of board (keep track)
var board = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null]
]


// set up doc to recieve stuff
var dragbox = document.getElementById("drag-box");
dragbox.addEventListener("mouseenter", mouseenter, false);
var gamegrid = document.getElementById("game-grid");

var boxarray = document.getElementsByClassName("drag");
// var titletext = document.getElementById("title");

document.addEventListener("mousedown", setpiece);
document.addEventListener("mouseup", setpiece);

// pick split
var split = 0;

// create game board
for (var i = 0; i < cols; i++){
  for (var j = 0; j < rows; j++){
    var square = document.createElement("div");
    square.classList.add("single-grid");
    gamegrid.appendChild(square);
    square.addEventListener("mouseenter", mouseenter, false);
    square.id = 's' + i + j;
  }
}

// create pieces
var pieces = [];
for (var i = 0; i < 4; i++){
  for (var j = 0; j < 4; j++){
    if (pieces[cursplit[i][j]]) {
      pieces[cursplit[i][j]].values.push(rangen[i][j])

      if (i >= 1){
        if (cursplit[i][j] == cursplit[i-1][j]){
          pieces[cursplit[i][j]].width += 1;
        }
      }

      if (j >= 1){
        if (cursplit[i][j] == cursplit[i][j-1]){
        pieces[cursplit[i][j]].height += 1;
        }
      }
    }

    else {
      var curp = new Piece(cursplit[i][j], 1, 1);
      curp.values.push(rangen[i][j])
      pieces.push(curp);
    }
  }
}



pieces = seededShuffle(pieces);

for (var i = 0; i < count; i++){
  var piece = document.createElement("div");
  piece.classList.add("drag");
  piece.classList.add("d"+pieces[i].height+pieces[i].width);
  piece.id = intToChar(i) + "d" + pieces[i].height + pieces[i].width + pieces[i].values.join("")

  for (var j = 0; j < pieces[i].values.length; j++){
    var box = document.createElement("div");
    box.classList.add("drag-box-square");
    box.dataset.val = pieces[i].values[j];
    // Replace number with image
    var img = document.createElement('img');
    img.src = 'assets/toyboxgame/' + pieces[i].values[j] + '.png';
    img.alt = pieces[i].values[j];
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    box.appendChild(img);
    // box.innerHTML = "<p>" + pieces[i].values[j] + "</p>";
    piece.appendChild(box);
  }

  dragbox.appendChild(piece);

}



// --- Game Cover, Timer, and End State ---
var gameStarted = false;
var gameEnded = false;
var timerInterval = null;
var timerStart = null;
var timerPausedAt = 0;
var timerPaused = false;
var timerElem = null;

function formatTime(ms) {
  var totalSec = Math.floor(ms / 1000);
  var min = Math.floor(totalSec / 60);
  var sec = totalSec % 60;
  return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
}

function updateTimerDisplay() {
  if (!timerElem) timerElem = document.getElementById('timer');
  if (!timerElem) return;
  var elapsed = timerPaused ? timerPausedAt : (Date.now() - timerStart + timerPausedAt);
  timerElem.textContent = formatTime(elapsed);
}

function startTimer() {
  timerStart = Date.now();
  timerPausedAt = 0;
  timerPaused = false;
  timerElem = document.getElementById('timer');
  timerInterval = setInterval(updateTimerDisplay, 200);
}

function pauseTimer() {
  if (!timerPaused) {
    timerPausedAt = Date.now() - timerStart + timerPausedAt;
    timerPaused = true;
    clearInterval(timerInterval);
  }
}

function resumeTimer() {
  if (timerPaused) {
    timerStart = Date.now();
    timerPaused = false;
    timerInterval = setInterval(updateTimerDisplay, 200);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
}

window.addEventListener('blur', pauseTimer);
window.addEventListener('focus', function() { if (gameStarted && !gameEnded) resumeTimer(); });

document.addEventListener('DOMContentLoaded', function() {
  var cover = document.getElementById('game-cover');
  var startBtn = document.getElementById('start-game-btn');
  var gameBox = document.querySelector('.game-box');
  timerElem = document.getElementById('timer');
  // Set puzzle number and date in the UI
  var puzzleNumElem = document.getElementById('puzzle-number');
  var puzzleDateElem = document.getElementById('puzzle-date');
  var puzzleNum = getPuzzleNumber();
  var puzzleDate = getPuzzleDateString().toLowerCase();
  if (puzzleNumElem) puzzleNumElem.textContent = 'toybox #' + puzzleNum;
  if (puzzleDateElem) puzzleDateElem.textContent = puzzleDate;
  if (cover && startBtn && gameBox) {
    cover.style.display = 'flex';
    gameBox.classList.add('game-covered');
    // Prevent clicks from propagating through the cover
    cover.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    startBtn.onclick = function(e) {
      e.stopPropagation();
      cover.style.display = 'none';
      gameBox.classList.remove('game-covered');
      gameStarted = true;
      gameEnded = false;
      startTimer();
    };
  }
});

// --- Drag and Drop State ---
var dragOffsetX = 0;
var dragOffsetY = 0;
var origParent = null;
var origNextSibling = null;
var origGridCellId = null;
var origCol = null;
var origRow = null;
var lastBoardCol = null;
var lastBoardRow = null;
var lastBoardHeight = null;
var lastBoardWidth = null;
var dragging = false;
var grabbedSubRow = 0;
var grabbedSubCol = 0;

// --- Drag and Drop Logic ---
function onMouseMove(e) {
  if (!dragging || !curpiece) return;
  curpiece.style.left = (e.pageX - dragOffsetX) + 'px';
  curpiece.style.top = (e.pageY - dragOffsetY) + 'px';
}

function setpiece(e) {
  // Early return if game hasn't started
  if (!gameStarted) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  
  // Disallow dropping in dragbox after win
  if (gameEnded && e.type === 'mouseup') {
    var dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    if (dropTarget && (dropTarget.id === 'drag-box' || (dropTarget.closest && dropTarget.closest('#drag-box')))) {
      return;
    }
  }
  
  if (e.type == 'mousedown') {
    var target = e.target.closest('.drag');
    // Robust: if not found, check all .drag pieces on the board for bounding box hit
    if (!target) {
      var allPieces = document.querySelectorAll('.drag');
      for (var i = 0; i < allPieces.length; i++) {
        var rect = allPieces[i].getBoundingClientRect();
        if (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        ) {
          target = allPieces[i];
          break;
        }
      }
    }
    if (!target) return;
    selected = true;
    curpiece = target;
    dragging = true;
    origParent = curpiece.parentNode;
    origNextSibling = curpiece.nextSibling;
    origGridCellId = null;
    origCol = null;
    origRow = null;
    lastBoardCol = null;
    lastBoardRow = null;
    lastBoardHeight = null;
    lastBoardWidth = null;
    if (curpiece.parentElement && curpiece.parentElement.classList.contains('single-grid')) {
      origGridCellId = curpiece.parentElement.id;
      origCol = parseInt(curpiece.parentElement.id.substring(1, 2));
      origRow = parseInt(curpiece.parentElement.id.substring(2, 3));
      // Track last position and size for robust clearing
      lastBoardCol = origCol;
      lastBoardRow = origRow;
      lastBoardHeight = parseInt(curpiece.id.substring(2, 3));
      lastBoardWidth = parseInt(curpiece.id.substring(3, 4));
    }
    var rect = curpiece.getBoundingClientRect();
    dragOffsetX = e.pageX - rect.left - window.scrollX;
    dragOffsetY = e.pageY - rect.top - window.scrollY;
    // Clear previous board cells if piece is on the grid
    if (lastBoardCol !== null && lastBoardRow !== null) {
      for (var i = 0; i < lastBoardHeight; i++) {
        for (var j = 0; j < lastBoardWidth; j++) {
          if (lastBoardCol + i >= 0 && lastBoardCol + i < 4 && lastBoardRow + j >= 0 && lastBoardRow + j < 4) {
            board[lastBoardCol + i][lastBoardRow + j] = null;
          }
        }
      }
    }
    // Figure out which sub-square was clicked
    var subBoxes = Array.from(curpiece.getElementsByClassName('drag-box-square'));
    grabbedSubRow = 0;
    grabbedSubCol = 0;
    for (var i = 0; i < subBoxes.length; i++) {
      var r = subBoxes[i].getBoundingClientRect();
      if (e.pageX >= r.left + window.scrollX && e.pageX <= r.right + window.scrollX && e.pageY >= r.top + window.scrollY && e.pageY <= r.bottom + window.scrollY) {
        var pheight = parseInt(curpiece.id.substring(2, 3));
        var pwidth = parseInt(curpiece.id.substring(3, 4));
        if (pheight === 1) {
          grabbedSubRow = 0;
          grabbedSubCol = i;
        } else if (pwidth === 1) {
          grabbedSubRow = i;
          grabbedSubCol = 0;
        } else {
          grabbedSubRow = Math.floor(i / pwidth);
          grabbedSubCol = i % pwidth;
        }
        break;
      }
    }
    curpiece.style.position = 'absolute';
    curpiece.style.zIndex = 1000;
    curpiece.style.pointerEvents = 'auto';
    curpiece.style.left = (e.pageX - dragOffsetX) + 'px';
    curpiece.style.top = (e.pageY - dragOffsetY) + 'px';
    document.body.appendChild(curpiece);
    document.addEventListener('mousemove', onMouseMove);
    // Remove all crosses from this piece (in case it's being moved)
    var squares = curpiece.querySelectorAll('.drag-box-square');
    squares.forEach(function(sq) {
      var cross = sq.querySelector('.red-cross');
      if (cross) cross.remove();
    });
  } else if (e.type == 'mouseup') {
    if (!dragging || !curpiece) return;
    document.removeEventListener('mousemove', onMouseMove);
    dragging = false;
    selected = false;
    if (curpiece) {
      curpiece.style.pointerEvents = 'none';
      curpiece.style.visibility = 'hidden';
    }
    var dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    if (dropTarget && dropTarget.classList && dropTarget.classList.contains('ghost-img')) {
      dropTarget = dropTarget.parentElement;
    }
    if (curpiece) {
      curpiece.style.visibility = 'visible';
      curpiece.style.pointerEvents = 'auto';
    }
    var gridCell = dropTarget && dropTarget.classList && dropTarget.classList.contains('single-grid') ? dropTarget : null;
    var inSidebar = dropTarget && (dropTarget.id === 'drag-box' || (dropTarget.closest && dropTarget.closest('#drag-box')));
    var placed = false;
    if (gridCell) {
      var col = parseInt(gridCell.id.substring(1, 2));
      var row = parseInt(gridCell.id.substring(2, 3));
      var pheight = parseInt(curpiece.id.substring(2, 3));
      var pwidth = parseInt(curpiece.id.substring(3, 4));
      var topLeftCol = col - grabbedSubRow;
      var topLeftRow = row - grabbedSubCol;
      var canplace = true;
      for (var i = 0; i < pheight; i++) {
        for (var j = 0; j < pwidth; j++) {
          if (topLeftCol + i < 0 || topLeftCol + i >= 4 || topLeftRow + j < 0 || topLeftRow + j >= 4 || board[topLeftCol + i][topLeftRow + j] != null) {
            canplace = false;
          }
        }
      }
      if (canplace) {
        var gridId = 's' + topLeftCol + topLeftRow;
        var snapCell = document.getElementById(gridId);
        if (snapCell) {
          snapCell.appendChild(curpiece);
          curpiece.style.position = '';
          curpiece.style.zIndex = '';
          curpiece.style.left = '';
          curpiece.style.top = '';
          curpiece.style.visibility = '';
          placed = true;
          for (var i = 0; i < pheight; i++) {
            for (var j = 0; j < pwidth; j++) {
              board[topLeftCol + i][topLeftRow + j] = curpiece.id.substring(4 + i + j, 5 + i + j);
            }
          }
          updatePieceErrors(curpiece, topLeftCol, topLeftRow);
          var allGridPieces = document.querySelectorAll('.single-grid > .drag');
          allGridPieces.forEach(function(piece) {
            if (piece === curpiece) return;
            var parentId = piece.parentElement.id;
            var col = parseInt(parentId.substring(1, 2));
            var row = parseInt(parentId.substring(2, 3));
            updatePieceErrors(piece, col, row);
          });
        }
      }
    }
    if (!placed && inSidebar) {
      dragbox.appendChild(curpiece);
      curpiece.style.position = '';
      curpiece.style.zIndex = '';
      curpiece.style.left = '';
      curpiece.style.top = '';
      curpiece.style.visibility = '';
      // Remove from board state if it was on the grid (robust)
      if (lastBoardCol !== null && lastBoardRow !== null) {
        for (var i = 0; i < lastBoardHeight; i++) {
          for (var j = 0; j < lastBoardWidth; j++) {
            if (lastBoardCol + i >= 0 && lastBoardCol + i < 4 && lastBoardRow + j >= 0 && lastBoardRow + j < 4) {
              board[lastBoardCol + i][lastBoardRow + j] = null;
            }
          }
        }
      }
      var squares = curpiece.querySelectorAll('.drag-box-square');
      squares.forEach(function(sq) {
        var cross = sq.querySelector('.red-cross');
        if (cross) cross.remove();
      });
      placed = true;
    }
    if (!placed) {
      if (origGridCellId) {
        var origCell = document.getElementById(origGridCellId);
        if (origCell) origCell.appendChild(curpiece);
        curpiece.style.position = '';
        curpiece.style.zIndex = '';
        curpiece.style.left = '';
        curpiece.style.top = '';
        curpiece.style.visibility = '';
        var pheight = parseInt(curpiece.id.substring(2, 3));
        var pwidth = parseInt(curpiece.id.substring(3, 4));
        for (var i = 0; i < pheight; i++) {
          for (var j = 0; j < pwidth; j++) {
            if (origCol !== null && origRow !== null && origCol + i >= 0 && origCol + i < 4 && origRow + j >= 0 && origRow + j < 4) {
              board[origCol + i][origRow + j] = curpiece.id.substring(4 + i + j, 5 + i + j);
            }
          }
        }
      } else if (origNextSibling && origNextSibling.parentNode === origParent) {
        origParent.insertBefore(curpiece, origNextSibling);
        curpiece.style.position = '';
        curpiece.style.zIndex = '';
        curpiece.style.left = '';
        curpiece.style.top = '';
        curpiece.style.visibility = '';
      } else {
        origParent.appendChild(curpiece);
        curpiece.style.position = '';
        curpiece.style.zIndex = '';
        curpiece.style.left = '';
        curpiece.style.top = '';
        curpiece.style.visibility = '';
      }
      var squares = curpiece.querySelectorAll('.drag-box-square');
      squares.forEach(function(sq) {
        var cross = sq.querySelector('.red-cross');
        if (cross) cross.remove();
      });
    }
    // After every move, update error overlays for all pieces on the board
    var allGridPieces = document.querySelectorAll('.single-grid > .drag');
    allGridPieces.forEach(function(piece) {
      var parentId = piece.parentElement.id;
      var col = parseInt(parentId.substring(1, 2));
      var row = parseInt(parentId.substring(2, 3));
      updatePieceErrors(piece, col, row);
    });
    updateGhostImages();
    curpiece = null;
    origGridCellId = null;
    origCol = null;
    origRow = null;
    lastBoardCol = null;
    lastBoardRow = null;
    lastBoardHeight = null;
    lastBoardWidth = null;
    // Check win condition
    var isWin = true;
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (board[i][j] == null) isWin = false;
        if (board[i][j] != board[j][i]) isWin = false;
      }
    }
    if (isWin) endGame();
  }
}

// --- DRAG AND DROP IMPROVEMENT END ---


// dragging piece around

function mouseenter(e) {
  // extract row and column # from the HTML element's id
	var col = e.target.id.substring(1,2);
	var row = e.target.id.substring(2,3);
  if (!selected) {
    e.stopPropagation();
    return;
  }

  // if mouseover to box
	if (e.target.id == "drag-box"){
    movepiece(e.target);

  } else if (e.target.id.substring(0, 1) == "s") {
    // piece in the grid
    var pheight = curpiece.id.substring(2, 3);
    var pwidth = curpiece.id.substring(3, 4);

    var canplace = true;

    // check whether can be placed
    for (var i = 0; i < parseInt(pheight); i++){
      for (var j = 0; j < parseInt(pwidth); j++){
        if (board[parseInt(col) + i][parseInt(row) + j] != null){
          canplace = false;
        }
      }
    }

    // place it!
    if (canplace && (parseInt(col) + parseInt(pheight) <= 4) && (parseInt(row) + parseInt(pwidth) <= 4)){
      movepiece(e.target);
    }
  }

	e.stopPropagation();
}


function movepiece(e){
  // remove piece at old position
	try { curpiece.parentNode.removeChild(curpiece);} catch(err){ /*console.log(err)*/}

	try { e.appendChild(curpiece);} catch(err){
		// console.log(err)
	} // add piece to new position
}


var quest = document.getElementById("overlay")

function toggleq(){
  quest.classList.toggle("show");
}

// --- Add Clear Board Button ---
// Add the button to the DOM after the grid is created
// var clearBtn = document.createElement('button');
// clearBtn.textContent = 'Clear Board';
// clearBtn.style.margin = '10px 0';
// clearBtn.style.fontSize = '1.2em';
// clearBtn.style.padding = '8px 20px';
// clearBtn.style.borderRadius = '8px';
// clearBtn.style.background = '#9A754E';
// clearBtn.style.color = '#fff';
// clearBtn.style.border = 'none';
// clearBtn.style.cursor = 'pointer';
// gamegrid.parentElement.insertBefore(clearBtn, gamegrid.nextSibling);
//
// clearBtn.addEventListener('click', function() {
//   // Move all pieces from grid to drag-box
//   var allPieces = document.querySelectorAll('.drag');
//   allPieces.forEach(function(piece) {
//     dragbox.appendChild(piece);
//     piece.style.position = '';
//     piece.style.zIndex = '';
//     piece.style.left = '';
//     piece.style.top = '';
//     piece.style.visibility = '';
//   });
//   // Clear board state
//   for (var i = 0; i < 4; i++) {
//     for (var j = 0; j < 4; j++) {
//       board[i][j] = null;
//     }
//   }
//   // Optionally reset win message
//   titletext.innerHTML = '';
//   document.getElementById('confetti-container').innerHTML = '';
// });
// --- End Clear Board Button ---


function clearBoard() {
  var allPieces = document.querySelectorAll('.drag');
  allPieces.forEach(function(piece) {
    dragbox.appendChild(piece);
    piece.style.position = '';
    piece.style.zIndex = '';
    piece.style.left = '';
    piece.style.top = '';
    piece.style.visibility = '';
    // Remove all crosses
    var squares = piece.querySelectorAll('.drag-box-square');
    squares.forEach(function(sq) {
      var cross = sq.querySelector('.red-cross');
      if (cross) cross.remove();
    });
  });
  // Clear board state
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      board[i][j] = null;
    }
  }
  // titletext.innerHTML = '';
  document.getElementById('confetti-container').innerHTML = '';
  updateGhostImages();
}

// Helper: add or remove red cross overlays on a piece
function updatePieceErrors(piece, topLeftCol, topLeftRow) {
  // Remove all previous crosses
  var squares = piece.querySelectorAll('.drag-box-square');
  squares.forEach(function(sq) {
    var cross = sq.querySelector('.red-cross');
    if (cross) cross.remove();
  });
  // Only check if piece is on the grid
  if (piece.parentElement && piece.parentElement.classList.contains('single-grid')) {
    var pheight = parseInt(piece.id.substring(2, 3));
    var pwidth = parseInt(piece.id.substring(3, 4));
    // Determine flex direction
    var flexDir = window.getComputedStyle(piece).flexDirection;
    for (var i = 0; i < pheight; i++) {
      for (var j = 0; j < pwidth; j++) {
        var gridI = topLeftCol + i;
        var gridJ = topLeftRow + j;
        if (
          gridI >= 0 && gridI < 4 && gridJ >= 0 && gridJ < 4 &&
          board[gridI][gridJ] != null &&
          board[gridJ][gridI] != null &&
          board[gridI][gridJ] !== board[gridJ][gridI]
        ) {
          // Calculate correct index based on flex direction
          var idx;
          if (flexDir === 'row') {
            idx = i * pwidth + j;
          } else if (flexDir === 'column') {
            idx = j * pheight + i;
          } else {
            idx = i * pwidth + j;
          }
          var sq = squares[idx];
          if (sq && !sq.querySelector('.red-cross')) {
            var cross = document.createElement('div');
            cross.className = 'red-cross';
            cross.textContent = '❌';
            sq.style.position = 'relative';
            sq.appendChild(cross);
          }
        }
      }
    }
  }
}

function updateGhostImages() {
  // Remove all existing ghost images
  var ghosts = document.querySelectorAll('.ghost-img');
  ghosts.forEach(function(g) { g.remove(); });

  // For every filled cell, if its mirror is empty, add a ghost image
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] != null && board[j][i] == null) {
        var gridId = 's' + j + i;
        var cell = document.getElementById(gridId);
        if (cell && !cell.querySelector('.ghost-img')) {
          var img = document.createElement('img');
          img.src = 'assets/toyboxgame/' + board[i][j] + '.png';
          img.className = 'ghost-img';
          cell.style.position = 'relative';
          cell.appendChild(img);
        }
      }
    }
  }
}

// --- Daily Puzzle Info ---
function getPuzzleDateObj() {
  // Use the same date as the seed
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  return { y, m, d };
}
function getPuzzleDateString() {
  var { y, m, d } = getPuzzleDateObj();
  // Format as 'July 17, 2025'
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[m - 1] + ' ' + d + ', ' + y;
}
function getPuzzleNumber() {
  // July 17, 2025 is #1
  var start = new Date(2025, 6, 17); // months are 0-indexed
  var today = new Date();
  var diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
}
// --- End Daily Puzzle Info ---

// --- End Game Logic ---
function endGame() {
  if (gameEnded) return;
  gameEnded = true;
  stopTimer();
  // Replace drag box with time and copy button
  var dragbox = document.getElementById('drag-box');
  var timeStr = (timerElem ? timerElem.textContent : '');
  var puzzleDate = getPuzzleDateString().toLowerCase();
  var puzzleNum = getPuzzleNumber();
  if (dragbox) {
    dragbox.innerHTML = '<div style="padding:2em;text-align:center;">toybox #' + puzzleNum + '<br>' + puzzleDate + '<br>🕓 <span id="final-time" style="font-weight:bold;">' + timeStr + '</span><br><button id="copy-time-btn" style="margin-top:1em;font-size:1em;padding:0.5em 1.5em;">Copy time</button></div>';
    var copyBtn = document.getElementById('copy-time-btn');
    if (copyBtn) {
      copyBtn.onclick = function() {
        var msg = `[toybox #${puzzleNum}]\n${puzzleDate}\n🕓 ${timeStr}\nhttps://toybox.hackclub.com`;
        navigator.clipboard.writeText(msg).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() { copyBtn.textContent = 'Copy time'; }, 1500);
        });
      };
    }
  }
  document.getElementById("confetti-container").innerHTML = '<div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>';
}
