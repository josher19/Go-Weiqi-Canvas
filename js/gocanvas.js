/*
        gocanvas.js -- Play Go (Weiqi) using the <canvas> tag.
               
        Copyright 2011 by Joshua S. Weinstein
        http://josher19.github.com/Go-Weiqi-Canvas/
         
        Portions of this code based on halma.js
		https://github.com/diveintomark/diveintohtml5/blob/master/examples/halma.js
		
		License: http://creativecommons.org/licenses/by/3.0/

*/

var kBoardWidth = 9;
var kBoardHeight= 9;
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

var gPassedTwice = false;

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

	var player = ++gMoveCount % 2 ? BLACK : WHITE;
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

function checkCapture(cell, color) { return false; }

function updateScore(color, points) { return false; }

function addPiece(cell, color) {
	cell.color = color;
    log(cell);

	// check for capture or illegal move
	var points = checkCapture(cell, color);
	if (points) {
		updateScore(color, points);
	} else if (illegalmove(cell, color)) {
		log("Illegal Move to " + cell);
		return false;
	}
	gPieces.push(cell);
	drawBoard();
	var pnum = (1+gMoveCount) % 2;
	if (document.forms.go && document.forms.go.player) {
		document.forms.go.player[pnum].checked = true;
	}
	return true;
}


function isTheGameOver() {
    return gPassedTwice;
}
function isBlack(piece) {
	return piece.color == BLACK;
}

// draw board

function drawBoard() {
    if (gGameInProgress && isTheGameOver()) {
	endGame();
    }

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    gDrawingContext.beginPath();
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
	gDrawingContext.moveTo(0.5 + x, 0);
	gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	gDrawingContext.moveTo(0, 0.5 + y);
	gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
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
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();
    if (selected) {
	gDrawingContext.fillStyle = "#000";
	gDrawingContext.fill();
    }
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
    gPieces = [new Cell(kBoardHeight - 3, 0),
	       new Cell(kBoardHeight - 2, 0),
	       new Cell(kBoardHeight - 1, 0),
	       new Cell(kBoardHeight - 3, 1),
	       new Cell(kBoardHeight - 2, 1),
	       new Cell(kBoardHeight - 1, 1),
	       new Cell(kBoardHeight - 3, 2),
	       new Cell(kBoardHeight - 2, 2),
	       new Cell(kBoardHeight - 1, 2)];
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
}

function initGame(canvasElement, moveCountElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "halma_canvas";
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
    if (!resumeGame()) {
	newGame();
    }
}
