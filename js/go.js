var BLACK='b',
	WHITE='w',
	BLANK='_';
	
var kBoardSize = kNumRows = kNumCols = 9; // or 19

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
function doCheck(r, c) { 
	//var p = goboard[r][c]; 
	initBoard(eyeBoard); 
	return checkRec(r, c, null); 
}

function showBoard(board) { return board.join("\n"); }

/* create randome board and zap items without eyes */

function walker(fcn, board, args) {
    for (var r = 0; r < board.length; ++r) {
        for (var c = 0; c < board.length; ++c) {
            log( fcn(r, c, args) );
        }
    }
}

function add4dir(r,c,fcn,p) {
	return fcn(r - 1, c, p) + fcn(r + 1, c, p) + fcn(r, c - 1, p) + fcn(r, c + 1, p);
}

function or4dir(r,c,fcn,p) {
	return fcn(r - 1, c, p) || fcn(r + 1, c, p) || fcn(r, c - 1, p) || fcn(r, c + 1, p);
}

/* Change player p's adjacent pieces to BLANK (thus removing them) */
function zap(r, c, p) { 
	if (isOutOfBounds(r) || isOutOfBounds(c)) return false;
	if (p == null) { p = goboard[r][c]; } 
	if (p == BLANK) return 0;
	if (isSame(r, c, p)) { goboard[r][c] = BLANK; return 1 + zap(r - 1, c, p) + zap(r + 1, c, p) + zap(r, c - 1, p) + zap(r, c + 1, p); } 
	return 0; 
}

/* Move to row, col by player */
function moveTo(row,col,color) {
	if (null == goboard) { goboard = new Board(); }
	if (null == goboard[row] || goboard[row][col] != BLANK) { return false; }
	goboard[row][col]=color;
	return true;
}

function findCaptures(r, c) { return add4dir(r, c, checkEyes) ; }

function checkEyes(r, c) { return doCheck(r, c) || zap(r, c); }

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

function get4dir(r, c, fcn, p) { return [fcn(r - 1, c, p), fcn(r + 1, c, p), fcn(r, c - 1, p), fcn(r, c + 1, p)]; }

function getColor(r, c) { return goboard[r] && goboard[r][c]; }

function same4(r,c) { var r=uniq(get4dir(r,c,getColor).filter( function(item,ndx) { return item})); return [ r.length ==1 && r[0] != BLANK, r]; }

/** Update pieces on the canvas */

function findCaptures(r, c) { return get4dir(r, c, checkEyes); }

function updateBoard() { return gPieces.filter(function (p) {return !isBlank(p.row, p.column);}); }

function showUpdatedBoard(r, c, p) { if (findCaptures(r, c, p)) { gPieces = updateBoard(gPieces); drawBoard(); } }

function moveAndCapture(cell) { showUpdatedBoard(cell.row,cell.column,cell.color); }

function isOutOfBounds(n) { return n < 0 || n >= kBoardSize; }
