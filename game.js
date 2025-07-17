
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

var choices = [[1, 3], [1, 3], [3, 1], [3, 1], [1, 3], [3, 1], [1, 2], [2, 1]];
var nums = [1, 2, 3, 4, 5, 6, 7];


var today = new Date()
var day = " " + today.getDate() + " " + today.getMonth() + " " + today.getFullYear()


// yes! the magic generation!
var count = 0;
for (var i = 0; i < 4; i++){
	for (var j = 0; j < 4; j++){
		if (cursplit[i][j] == null){
			var finished = false;
			var ori = choose(choices);
			var ori_width = ori[0];
			var ori_height = ori[1];

			var testc = 0
			while (i + ori_height > 4 || j + ori_width  > 4) {
				ori = choose(choices);
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
		rangen[j][i] = rangen[i][j] = choose(nums);
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
var titletext = document.getElementById("title");

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



pieces = shuffle(pieces);

for (var i = 0; i < count; i++){
  var piece = document.createElement("div");
  piece.classList.add("drag");
  piece.classList.add("d"+pieces[i].height+pieces[i].width);
  piece.id = intToChar(i) + "d" + pieces[i].height + pieces[i].width + pieces[i].values.join("")

  for (var j = 0; j < pieces[i].values.length; j++){
    var box = document.createElement("div");
    box.classList.add("drag-box-square");
    box.dataset.val = pieces[i].values[j];
    box.innerHTML = "<p>" + pieces[i].values[j] + "</p>";
    piece.appendChild(box);
  }

  dragbox.appendChild(piece);

}



// --- DRAG AND DROP IMPROVEMENT START ---
// Variables for drag
var dragOffsetX = 0;
var dragOffsetY = 0;
var origParent = null;
var origNextSibling = null;
var dragging = false;
// New: which sub-square of the piece was grabbed
var grabbedSubRow = 0;
var grabbedSubCol = 0;

function onMouseMove(e) {
  if (!dragging || !curpiece) return;
  curpiece.style.left = (e.pageX - dragOffsetX) + 'px';
  curpiece.style.top = (e.pageY - dragOffsetY) + 'px';
}

function setpiece(e) {
  if (e.type == 'mousedown') {
    var target = e.target.closest('.drag');
    if (!target) return;
    selected = true;
    curpiece = target;
    dragging = true;
    origParent = curpiece.parentNode;
    origNextSibling = curpiece.nextSibling;
    var rect = curpiece.getBoundingClientRect();
    dragOffsetX = e.pageX - rect.left - window.scrollX;
    dragOffsetY = e.pageY - rect.top - window.scrollY;
    // New: figure out which sub-square was clicked
    var subRect = null;
    var subBoxes = Array.from(curpiece.getElementsByClassName('drag-box-square'));
    grabbedSubRow = 0;
    grabbedSubCol = 0;
    for (var i = 0; i < subBoxes.length; i++) {
      var r = subBoxes[i].getBoundingClientRect();
      if (e.pageX >= r.left + window.scrollX && e.pageX <= r.right + window.scrollX && e.pageY >= r.top + window.scrollY && e.pageY <= r.bottom + window.scrollY) {
        subRect = r;
        // Figure out row/col in the piece
        var pheight = parseInt(curpiece.id.substring(2, 3));
        var pwidth = parseInt(curpiece.id.substring(3, 4));
        if (pheight === 1) {
          grabbedSubRow = 0;
          grabbedSubCol = i;
        } else if (pwidth === 1) {
          grabbedSubRow = i;
          grabbedSubCol = 0;
        } else {
          // For 2x2 or larger, assume row-major order
          grabbedSubRow = Math.floor(i / pwidth);
          grabbedSubCol = i % pwidth;
        }
        break;
      }
    }
    curpiece.style.position = 'absolute';
    curpiece.style.zIndex = 1000;
    curpiece.style.pointerEvents = 'none';
    curpiece.style.left = (e.pageX - dragOffsetX) + 'px';
    curpiece.style.top = (e.pageY - dragOffsetY) + 'px';
    document.body.appendChild(curpiece);
    document.addEventListener('mousemove', onMouseMove);
  } else if (e.type == 'mouseup') {
    if (!dragging || !curpiece) return;
    document.removeEventListener('mousemove', onMouseMove);
    dragging = false;
    selected = false;
    curpiece.style.pointerEvents = 'auto';
    curpiece.style.visibility = 'hidden';
    var dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    curpiece.style.visibility = 'visible';
    var gridCell = dropTarget && dropTarget.classList && dropTarget.classList.contains('single-grid') ? dropTarget : null;
    var inSidebar = dropTarget && (dropTarget.id === 'drag-box' || dropTarget.closest && dropTarget.closest('#drag-box'));
    var placed = false;
    if (gridCell) {
      // Try to place the piece in the grid, offset by grabbed sub-square
      var col = parseInt(gridCell.id.substring(1, 2));
      var row = parseInt(gridCell.id.substring(2, 3));
      var pheight = parseInt(curpiece.id.substring(2, 3));
      var pwidth = parseInt(curpiece.id.substring(3, 4));
      // Offset so the grabbed sub-square lands under the cursor
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
        // Snap to grid cell
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
          // Update board state
          for (var i = 0; i < pheight; i++) {
            for (var j = 0; j < pwidth; j++) {
              board[topLeftCol + i][topLeftRow + j] = curpiece.id.substring(4 + i + j, 5 + i + j);
            }
          }
        }
      }
    }
    // --- Allow dropping back to sidebar ---
    if (!placed && inSidebar) {
      dragbox.appendChild(curpiece);
      curpiece.style.position = '';
      curpiece.style.zIndex = '';
      curpiece.style.left = '';
      curpiece.style.top = '';
      curpiece.style.visibility = '';
      // Remove from board state if it was on the grid
      var pheight = parseInt(curpiece.id.substring(2, 3));
      var pwidth = parseInt(curpiece.id.substring(3, 4));
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          if (board[i][j] && curpiece.id.includes(board[i][j])) {
            board[i][j] = null;
          }
        }
      }
      placed = true;
    }
    if (!placed) {
      // Return to drag area
      if (origNextSibling && origNextSibling.parentNode === origParent) {
        origParent.insertBefore(curpiece, origNextSibling);
      } else {
        origParent.appendChild(curpiece);
      }
      curpiece.style.position = '';
      curpiece.style.zIndex = '';
      curpiece.style.left = '';
      curpiece.style.top = '';
      curpiece.style.visibility = '';
    }
    curpiece = null;
    // Check win condition
    var win = true;
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (board[i][j] == null) {
          win = false;
        }
        if (board[i][j] != board[j][i]) {
          win = false;
        }
      }
    }
    if (win) {
      titletext.innerHTML = "you win!!!!! 🎉🎉";
      document.getElementById("confetti-container").innerHTML = '<div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>';
    }
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
var clearBtn = document.createElement('button');
clearBtn.textContent = 'Clear Board';
clearBtn.style.margin = '10px 0';
clearBtn.style.fontSize = '1.2em';
clearBtn.style.padding = '8px 20px';
clearBtn.style.borderRadius = '8px';
clearBtn.style.background = '#9A754E';
clearBtn.style.color = '#fff';
clearBtn.style.border = 'none';
clearBtn.style.cursor = 'pointer';
gamegrid.parentElement.insertBefore(clearBtn, gamegrid.nextSibling);

clearBtn.addEventListener('click', function() {
  // Move all pieces from grid to drag-box
  var allPieces = document.querySelectorAll('.drag');
  allPieces.forEach(function(piece) {
    dragbox.appendChild(piece);
    piece.style.position = '';
    piece.style.zIndex = '';
    piece.style.left = '';
    piece.style.top = '';
    piece.style.visibility = '';
  });
  // Clear board state
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      board[i][j] = null;
    }
  }
  // Optionally reset win message
  titletext.innerHTML = '';
  document.getElementById('confetti-container').innerHTML = '';
});
// --- End Clear Board Button ---
