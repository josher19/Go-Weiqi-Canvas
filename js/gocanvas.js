/*
        gocanvas.js -- Play Go (Weiqi) using the <canvas> tag.
               
        Copyright 2011 by Joshua S. Weinstein
        http://josher19.github.com/Go-Weiqi-Canvas/
         
        Portions of this code based on halma.js
		https://github.com/diveintomark/diveintohtml5/blob/master/examples/halma.js
		
		License: http://creativecommons.org/licenses/by/3.0/

*/

var kBoardWidth = 9;
var kBoardHeight= kBoardWidth;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;

var gPieces;
var gNumPieces;
var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
var gMoveCount;
var gMoveCountElem;
var gGameInProgress;

var gPassedCount = 0; // Two Passes => Quit
var gResigned = false;

function resizeBoard(boardsize) {
	kBoardWidth = boardsize;
	kBoardHeight= kBoardWidth;
	kPieceWidth = 50 + 18 - 2*kBoardWidth; // between 30 for 19x19 and 68 for 5x5
	kPieceHeight= 50 + 18 - 2*kBoardHeight;
	kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
	kPixelHeight= 1 + (kBoardHeight * kPieceHeight);
	gCanvasElement.width = kPixelWidth
	gCanvasElement.height = kPixelHeight;
	drawBoard();
	// reset board and other things
	return boardsize;
}

function Cell(row, column, color) {
    this.row = row;
    this.column = column;
	this.color = color || BLANK;
}
Cell.prototype.toString = function() {
	return "Cell[r=" + this.row + ", c=" + this.column + ",p = " + this.color + "]";
}


function getCursorPosition(e) {
    /* returns Cell with .row and .column properties */
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
	x = e.pageX;
	y = e.pageY;
    }
    else {
	x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
    return cell;
}

// jsw

function goOnClick(e) {
	var cell = getCursorPosition(e);

	var player = gMoveCount % 2 ? BLACK : WHITE;
    return addPiece(cell, player);

}

function isOccupied(cell) {
  for (var i = 0; i < gPieces.length; i++) {
	if ((gPieces[i].row == cell.row) && 
	    (gPieces[i].column == cell.column)) {	    
		cell.stepsOn = i; // if we need to know which piece was clicked
	    return true;
	}
  }
  return false;
}

// these needed to be filled in

function illegalmove(cell, color) { return isOccupied(cell); }

function checkCapture(cell, color, docapture) { return false; }

function updateScore(color, points) { return false; }

function moveToCell(cell) {
	if (typeof GO != "undefined" && GO && "function" == typeof GO.moveTo) {
		return GO.moveTo(cell.row, cell.column, cell.color);
	}
	return true;
}

/** Add piece to board */
function addPiece(cell, color) {
	cell.color = color;
    log(cell);

	// check for capture or illegal move
	var points = checkCapture(cell, color, true);
	if (points) {
		updateScore(color, points);
	} else if (illegalmove(cell, color)) {
		log("Illegal Move to " + cell);
		warn("Illegal Move to " + cell);
		return false;
	}
	if (!moveToCell(cell)) { 
		log("Cannot move to " + cell)
		return false
	}
	// moveAndCapture(cell)
	gPieces.push(cell) 
	nextPlayer()
    //showUpdatedBoard();
	return true;
}

/** Next Player's Turn */
function nextPlayer() {
    gPieces = updateBoard(gPieces);
	drawBoard()
	var pnum = (gMoveCount++) % 2;
	if ("undefined" != typeof players && players) curPlayer = players[pnum];
	if (document.forms.go && document.forms.go.player) {
		document.forms.go.player[pnum].checked = true;
	}
}

/** TODO: Look into other scoring methods, eye or captured pieces count */
function getScore() { return gPieces.map(function(item) { switch(item.color) { case BLACK: return -1; break; case WHITE: return 1; break; default: return 0; break;} }).reduce(function(a,b) {return a+b}); }

function isTheGameOver() {
    return gPassedCount >= 2 || gResigned;
}
function isBlack(piece) {
	return piece.color == BLACK;
}

/** Button Click Events for the Form */
function initForm(frm) {
	if (frm.confirm) frm.confirm.onclick = function(ev) {gPassedCount = 0;}
	if (frm.pass) frm.pass.onclick = function(ev) {++gPassedCount;info("pass");nextPlayer();}
	if (frm.resign) frm.resign.onclick = function(ev) {gResigned = true}
}

// draw board

function drawBoard() {
    if (gGameInProgress && isTheGameOver()) {
	endGame();
    }

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    gDrawingContext.beginPath();
    
    /* vertical lines */
    var startpx = kPieceWidth / 2;
    for (var x = startpx; x <= kPixelWidth; x += kPieceWidth) {
        gDrawingContext.moveTo(0.5 + x, startpx);
        gDrawingContext.lineTo(0.5 + x, kPixelHeight - startpx);
    }
    
    /* horizontal lines */
    for (var y = startpx; y <= kPixelHeight; y += kPieceHeight) {
		gDrawingContext.moveTo(startpx, 0.5 + y);
		gDrawingContext.lineTo(kPixelWidth - startpx, 0.5 +  y);
    }
    
    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
    
    for (var i = 0; i < gPieces.length; i++) {
	drawPiece(gPieces[i], isBlack(gPieces[i], i == gSelectedPieceIndex));
    }

    gMoveCountElem.innerHTML = gMoveCount;

    saveGameState();
}

function drawPiece(p, selected) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.strokeWidth = 4;
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.stroke();
    gDrawingContext.fillStyle = "#fff";
    if (selected) {
	gDrawingContext.fillStyle = "#000";
    }
    gDrawingContext.fill();
}

if (typeof resumeGame != "function") {
    saveGameState = function() {
	return false;
    }
    resumeGame = function() {
	return false;
    }
}

function newGame() {
    gPieces = [];
    gNumPieces = gPieces.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
    gSelectedPieceIndex = -1;
    gGameInProgress = false;
    info("The game is over"); // should display prominently, disable parts of UI
    if (initGame.frm && initGame.frm.boardSize) initGame.frm.boardSize.disabled = false;
    // initGame.restart();
}

function initGame(canvasElement, moveCountElement, frm) {
	initGame.frm = frm;
	if (frm && frm.boardSize) frm.boardSize.onchange = function(ev) {
		if (gPieces.length === 0 || gGameInProgress === false) { // first move or game over
			gPieces.length = 0; // truncate
			resizeBoard(this.value);
			GO.setSize(this.value);
		} else {
			info("must finish current game");
			this.value = goboard.length;
			this.disabled=true;
		}
	}
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "gocanvas";
	document.body.appendChild(canvasElement);
    }
    if (!moveCountElement) {
        moveCountElement = document.createElement("p");
	document.body.appendChild(moveCountElement);
    }
    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    gCanvasElement.addEventListener("click", goOnClick, false);
    gMoveCountElem = moveCountElement;
    gDrawingContext = gCanvasElement.getContext("2d");
    initForm(frm);
    if (!resumeGame()) {
	newGame();
    }
}
