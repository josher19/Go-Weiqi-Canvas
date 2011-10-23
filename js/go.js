var BLACK='b',
	WHITE='w',
	BLANK='_';
	
var kBoardSize = self.kBoardWidth ? kBoardWidth : 9; // or 19

GO = {}

// function hasEye(r,c) { if (r < 0 || c < 0 || r >= goboard.length ) return false; return goboard[r][c]==BLANK || hasEye(r-1,c) || hasEye(r+1,c) || hasEye(r,c-1) || hasEye(r,c+1) }

function Board() {
    var rows, cols, goboard = [];
    for (rows = 0; rows < kBoardSize; ++rows) {
        goboard[rows] = [];
        for (cols = 0; cols < kBoardSize; ++cols) {
            goboard[rows][cols] = BLANK;
        }
    }
    return goboard;
}

/* var */
goboard = new Board();

function Player(color) {
	this.color = color;
	this.captured = 0;
}

var blackPlayer = new Player(BLACK),
	whitePlayer = new Player(WHITE);

var players = [blackPlayer, whitePlayer];
var viewers = []; // stub for game viewers

function isBlank(r, c) { return goboard[r] && goboard[r][c] == BLANK; }

function isSame(r, c, player) { return goboard[r] && goboard[r][c] == player; }

function randomBoard(board) {
  for(rows=0;rows<kBoardSize;++rows) {board[rows]=[]; for(cols=0;cols<kBoardSize;++cols) board[rows][cols]= Math.random() < 0.5 ? BLACK : WHITE; }
  return board;
}

function showBoard(board) {
   return board.join("\n")
}

function log(msg) { self.Shell && Shell.println(msg, "print"); }
function info(msg) { if(self.console && console.info) console.info(msg); }

var eyeBoard=new Board();

/** 
 * Check if group starting at r=row, c=column of p=color is Alive.
 * If ra is set, save all Blank Spaces in ra using ra.push([row,column]).
 */
function checkNonRec(r,c, p,ra) {
	return checkIsAlive(addUnique([],r,c), p, ra, true);
}

function addUnique(clist,r,c) {
	var item = [r,c].join(":");
	if (false==areOutOfBounds(r,c) && clist.indexOf(item) == -1) clist.push(item);
	return clist;	
}

function checkIsAlive(clist, p, allBlanks, verbose) {
	var hasABlankSpace = false;
	for(var i=0; i<clist.length; ++i) {
		var here=clist[i].split(":");
		var r=here[0]-0, c=here[1]-0;
		if (isOutOfBounds(r) || isOutOfBounds(c)) {
			info("edge");
			// next;
		} else {
			p= p || goboard[r][c];
			info(["checkIsAlive", r, c, p, goboard[r][c] ]);
			var isEmpty = isBlank(r,c,p)
			if (isEmpty) {
				if (!allBlanks) return true; // Blank == Alive, jump out
				++hasABlankSpace; // convert to number
				info(["Found", hasABlankSpace, "empty spaces"].join(" "));
				if (allBlanks.push) { allBlanks.push([r,c]); };
				if (!verbose) isEmpty = false;
			} 
			if (isSame(r, c, p) || isEmpty) {
				addUnique(clist,r-1,c  );
				addUnique(clist,r  ,c-1);
				addUnique(clist,r+1,c  );
				addUnique(clist,r  ,c+1);
				info(clist.length);
			}
		}
		
	} // end loop
	info(hasABlankSpace + ", checked: " + [i,clist.length]);
	return hasABlankSpace;
}

function toScore(score,color) {
	return color == BLACK ? -score : color == WHITE ? score : 0.5;
}


var scoreboard = new Board();
function getEyeCount(row,col,p) {
	// var start=p || BLANK;
	var edge;
	var score = 0, r, c;
	var clist = [row+":"+col];	
	for(var i=0; i<clist.length; ++i) {
		var here=clist[i].split(":");
		r=here[0]-0, c=here[1]-0;		
		if (isOutOfBounds(r) || isOutOfBounds(c)) {
			info("edge");
			// next;
		} else {
			var stone = goboard[r][c];
			p= p || stone;
			info(["getEyeCount", r, c, p,  stone]);
			var isEmpty = isBlank(r,c,p);
			if (/* isSame(r, c, p) || */ isEmpty && BLANK == scoreboard[r][c]) {
				++score;
				scoreboard[r][c] = 0; // toScore(1,edge);
				addUnique(clist,r-1,c  );
				addUnique(clist,r  ,c-1);
				addUnique(clist,r+1,c  );
				addUnique(clist,r  ,c+1);
				info(clist.length);
			} else {
				if (edge && stone != edge) { // Two Colors
					return scoreboard[r][c]=score=0;
				}
				edge = stone;
				scoreboard[r][c]=toScore(1,stone);
			}
		}
		
	} // end loop
	// could cache clist results
	info('score: ' + score + ', color: ' + edge + ', list: ' + clist);
	if (scoreboard[row]) scoreboard[row][col]=toScore(score,edge);
	//log('r=' + r + ', c=' + c);
	return scoreboard; // toScore(score,edge);
}

/* instead of recursive, could make a list of pieces in the group */
function checkRec(r, c, p, fcn) {
    if (null == fcn) {
        fcn = checkRec;
    }    
    if (r < 0 || c < 0 || r >= eyeBoard.length || c >= eyeBoard.length) {
        info("edge");
        return false;
    }
    if (null == p) {
		p = goboard[r][c]; 
	}
    info([fcn.name, r, c, p, goboard[r][c] ]);
    if (eyeBoard[r][c] === false) {
        info("already checked");
        return false;
    }
    eyeBoard[r][c] = isBlank(r, c, p);
    if (!isSame(r, c, p)) {
        return eyeBoard[r][c];
    }
    return eyeBoard[r][c] = isBlank(r, c, p) ||
        fcn(r - 1, c, p) ||
        fcn(r, c - 1, p) || fcn(r + 1, c, p) || fcn(r, c + 1, p);
}

function initBoard(goboard, initValue) {
    var rows, cols, goboard = goboard || [];
    for (rows = 0; rows < kBoardSize; ++rows) {
        goboard[rows] = goboard[rows] || [];
        for (cols = 0; cols < kBoardSize; ++cols) {
            goboard[rows][cols] = initValue;
        }
    }
    return goboard;
}

/** check if group (containing piece at row, column) has any eyes */
function doCheckAlive(r, c, p) { 
	//var p = goboard[r][c]; 
	initBoard(eyeBoard); 
	return checkRec(r, c, p); 
}

/** 
 * Check if group (containing stone of color p at row r and column c) 
 * contains any Liberties. Return True if dead (no liberties).
 */ 
function doCheckDead(r,c,p) {
	if (false && doCheckAlive(r, c, p) != checkNonRec(r,c,p)) {
		alert("checkNonRec failed at " + [r,c,p]);
	}
	return !checkNonRec(r,c,p);
}

function showBoard(board) { return board.join("\n"); }

/* create randome board and zap items without eyes */

function walker(fcn, board, args, logger) {
	if (null == logger) logger = log;
    for (var r = 0; r < board.length; ++r) {
        for (var c = 0; c < board.length; ++c) {
            logger( fcn(r, c, args) );
        }
    }
}

function add4dir(r,c,fcn,p) {
	return fcn(r - 1, c, p) + fcn(r + 1, c, p) + fcn(r, c - 1, p) + fcn(r, c + 1, p);
}

function or4dir(r,c,fcn,p) {
	return fcn(r - 1, c, p) || fcn(r + 1, c, p) || fcn(r, c - 1, p) || fcn(r, c + 1, p);
}

// TODO: Record Captures in Player.captures
/** Change player p's adjacent pieces to BLANK (thus removing them) */
function zap(r, c, p) { 
	if (isOutOfBounds(r) || isOutOfBounds(c)) return false;
	if (p == null) { p = goboard[r][c]; } 
	if (p == BLANK) return 0;
	if (isSame(r, c, p)) { goboard[r][c] = BLANK; return 1 + zap(r - 1, c, p) + zap(r + 1, c, p) + zap(r, c - 1, p) + zap(r, c + 1, p); } 
	return 0; 
}

function warn(msg) {
	var w=document.getElementById("warnings");
	if (w) {
		w.innerHTML = msg || "";
		setTimeout(warn, 15000);
	}
	else if (msg) alert(msg);
}

function canCapture(r,c,p) { return findCaptures(r,c,p).filter(function(item) { return typeof item == "number" && item > 0}).length > 0 }

/* Move to row, col by player */
GO.moveTo = function moveTo(row,col,color) {
	if (null == goboard) { goboard = new Board(); }
	if (null == goboard[row] || goboard[row][col] != BLANK) { return false; }
	goboard[row][col]=color;
	var isDead = false === doCheckAlive(row,col);
	var hasCaptured = canCapture(row,col,color);
	if (isDead && ! hasCaptured ) { 
		goboard[row][col]=BLANK; 
		warn("Illegal move: cannot capture own piece(s): " + [row,col,color]);
		return false;
	}
	// warn("");
	GO.getRecorder().moveTo(row,col,color);
	return true;
}

//~ function findCaptures(r, c) { return add4dir(r, c, checkEyes) ; }

function countCaptures(r,c,p) { return doCheckDead(r,c,p) && zap(r,c,p); }

function checkEyes(r, c, p) { return doCheckAlive(r, c, p) || zap(r, c, p); }

function rndItem() { return Math.floor(Math.random() * kBoardSize); }

function checkRandom() { var r = rndItem(), c = rndItem(); return [r, c, goboard[r][c], checkEyes(r, c)]; }

function makeRandom(goboard) { 
	randomBoard(goboard);  
	walker(checkRandom, goboard);
	walker(checkEyes,goboard);
	return showBoard(goboard);
}

/* Check for Covered Eyes */

function uniq(ra) { var res = []; for (var i = 0; i < ra.length; ++i) { if (ra[i] != ra[i - 1]) { res.push(ra[i]); } } return res; }

function get4dir(r, c, fcn, p) { return [fcn(r - 1, c, p), fcn(r, c - 1, p), fcn(r + 1, c, p), fcn(r, c + 1, p)]; }

function getColor(r, c) { return goboard[r] && goboard[r][c]; }

function same4(r,c) { var r=uniq(get4dir(r,c,getColor).filter( function(item,ndx) { return item})); return [ r.length ==1 && r[0] != BLANK, r]; }

function otherPlayer(p) { return p === WHITE ? BLACK : p === BLACK ? WHITE : p }

function findCaptures(r, c, p) { return get4dir(r, c, checkEyes, otherPlayer(p)); }

/** Boundary based on board size */

function isOutOfBounds(n) { return n < 0 || n >= kBoardSize; }

function areOutOfBounds(/*vargs...*/) { 
	for(var i=0; i<arguments.length; ++i) {
		n = arguments[i];
		if (n < 0 || n >= kBoardSize) return true;; 
	}
	return false;
}

/** Update pieces on the canvas */

function updateBoard() { return gPieces.filter(function (p) {return !isBlank(p.row, p.column);}); }

//~ function showUpdatedBoard(r, c, p) { if (findCaptures(r, c, p)) { gPieces = updateBoard(gPieces); drawBoard(); } }

function showUpdatedBoard() { gPieces = updateBoard(gPieces); drawBoard(); }

//~ function moveAndCapture(cell) { showUpdatedBoard(cell.row,cell.column,cell.color); }

function updateStones() { gPieces = updateBoard(gPieces); }

function getCoveredEyes() {
	var ra = []; 
	var more = function(item) { ra.push(item); }
	walker(same4,goboard,null,more)
	return ra.map(function(item) { if (item[0]) return item[1][0];  }).filter(function(item) {return item});
}

/*
 * Get controlled by (board):
 *     for each square on board:
 * 			when BLACK: -1
 * 			when WHITE: 1
 * 			when BLANK: 
 * 				 get Border:
 * 					when BLACK: -1
 * 					when WHITE: 1
 * 					MIXED: 0
 * 
 * get Border(row, col, p):
 * 		return  getGroupBorder(row,col,p || BLANK)
 * 
 * get Group Border (row,col,p):
 * 		add 4 directions to group
 * 		for each item in group:
 * 			if (item.color == p): // if color same as group: 
 * 				add 4 directions unless already on list
 * 			else:
 * 				add [row,col,p] to border
 * 		return {group, border}
 * 
 */

/** Record Moves */
function Recorder(elem,header,displayFnc) {

	this.displayArea = elem;
	this.hist = [];
	this.header = header || '';
	if (displayFnc) this.display = displayFunc; // @overwrite

}
	
Recorder.prototype = {
	/** Record and display a move in SGF format */
	moveTo : function recordMove(r,c,p) { var m=this.sgfMove(r,c,p); this.hist.push(m); this.display(m); return m; }
	, display: function display() { if (this.displayArea) this.displayArea.innerHTML = this.header + this.hist.join("\n;"); return this.displayArea; }
	, sgfMove : function sgfMove(r,c,p) { return String(p).toUpperCase() + "[" + this.numToLetter(r) + this.numToLetter(c) + "]"; }
	, numToLetter : function numToLetter(n) { return String.fromCharCode(97 + n); }
}

GO.getRecorder = function getRecorder() {
	if (!GO.recorder) GO.recorder = new Recorder(document.getElementById('displayMoves'), '');
	return GO.recorder;
}