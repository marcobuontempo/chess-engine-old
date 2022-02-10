class ChessEngine {
    constructor(fen) {
        this._chessboard = new Chessboard(fen),  //the game board to operate within
        this._currentTurn = "white",    //current turn's colour
        this._selectedTile = [],    //the currently selected piece
        this._selectedPieceMoves = [], //the tiles that the current selected piece is attacking
        this._currentTurnMoves = [],    //the tiles that the current player is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._oppositionTurnMoves = [],    //the tiles that the opposition is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._currentKingIsInCheck = false,  //whether the current colour's king is in check
        this.eventHandlers = {  //bind methods. otherwise, 'this' refers to the global variable (this.window). also gives reference so we can remove event listeners
            clickTile: this.clickTile.bind(this)
        }
    }

    //Getters
    getChessboard() {
        return this._chessboard;
    }
    getCurrentTurn() {
        return this._currentTurn;
    }
    getNextTurn() {
        return this._currentTurn=="white" ? "black" : "white";
    }
    getSelectedTile() {
        return this._selectedTile;
    }
    getSelectedPieceMoves() {
        return this._selectedPieceMoves;
    }
    getCurrentTurnMoves() {
        return this._currentTurnMoves;
    }
    getOppositionTUrnMoves() {
        return this._oppositionTurnMoves;
    }
    getCurrentKingIsInCheck() {
        return this._currentKingIsInCheck;
    }

    //Setters
    setCurrentTurn(newColour) {
        this._currentTurn = newColour;
    }
    setSelectedTile(boardFile,boardRank) {
        this._selectedTile = [boardFile,boardRank];
    }
    setSelectedPieceMoves(newMoves) {
        this._selectedPieceMoves = newMoves;
    }
    setCurrentTurnMoves(newMoves) {
        this._currentTurnMoves = newMoves;
    }
    setOppositionTurnMoves(newMoves) {
        this._oppositionTurnMoves = newMoves;
    }
    setCurrentKingIsInCheck(isChecked) {
        this._kingIsInCheck = isChecked;
    }

    //Piece Interaction
    addPieceEventListeners() {
        const boardTiles = document.querySelectorAll(".board-tile")
        boardTiles.forEach((boardTile) => {
            boardTile.addEventListener("click", this.eventHandlers.clickTile)
        })
    }
    clickTile(e) {
        const newTileHtml = e.target.classList.contains("board-piece") ? e.target.parentNode : e.target; //to select tile that the piece is on
        const newBoardFile = Number(newTileHtml.dataset.boardFile)
        const newBoardRank = Number(newTileHtml.dataset.boardRank)
        const newSelectedTileObject = this.getChessboard().getTile(newBoardFile,newBoardRank) 
        const newSelectedValue = `${newBoardFile}${newBoardRank}`
        const previousSelectedValue = this.getSelectedTile().join("")
        const previousTileHtml = document.querySelector(`[data-board-file='${previousSelectedValue[0]}'][data-board-rank='${previousSelectedValue[1]}']`)

        if(!previousSelectedValue && newSelectedTileObject.hasPiece!=null && newSelectedTileObject.hasPiece.pieceColour==this.getCurrentTurn()) { 
            //if no previous piece selected, select newly clicked piece
            this.setSelectedTile(newBoardFile,newBoardRank)
            newTileHtml.style.backgroundColor = "red"
            const pieceMoves = this.generateMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves(pieceMoves)
        } else if (previousSelectedValue==newSelectedValue) {
            //if same piece is re-selected, disable the piece's selection
            this.setSelectedTile([])
            newTileHtml.style.backgroundColor = newTileHtml.dataset.tileColour 
            const pieceMoves = this.generateMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves([])
        } else if (previousSelectedValue!=newSelectedValue && newSelectedTileObject.hasPiece!=null && newSelectedTileObject.hasPiece.pieceColour==this.getCurrentTurn()) {    
            //if new valid piece is selected, un-select previous and re-select new
            this.setSelectedTile(newBoardFile,newBoardRank)
            previousTileHtml.style.backgroundColor = previousTileHtml.dataset.tileColour
            newTileHtml.style.backgroundColor = "red"

            this.toggleValidMovesHighlight(this.getSelectedPieceMoves())

            const pieceMoves = this.generateMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves(pieceMoves)
        } else {
            //otherwise, move piece
        }
    }

    // handleMovePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) { 

    // }
    movePiece(fileFrom,rankFrom,fileTo,rankTo) {
        const pieceFrom = this.getChessboard().getTile(fileFrom,rankFrom).hasPiece
        this.getChessboard().setTilePiece(fileFrom,rankFrom,null) //remove existing piece from first tile
        this.getChessboard().setTilePiece(fileTo,rankTo,pieceFrom) //set existing piece onto second tile
    }

    //Helpers
    isPieceCapturable(boardFileFrom, boardRankFrom, boardFileTo, boardRankTo) {
        const tileFrom = this.getChessboard().getTile(boardFileFrom,boardRankFrom)
        const tileTo = this.getChessboard().getTile(boardFileTo,boardRankTo)
        if(tileFrom.hasPiece.pieceColour != tileTo.hasPiece.pieceColour) {
            return true;
        } else {
            return false;
        }
    }
    isOnBoardEdge(direction, boardFile, boardRank) {
        let onEdge = false;
        switch(direction) {
            case("A-H"): if(boardFile==8) onEdge=true; break;
            case("H-A"): if(boardFile==1) onEdge=true; break;
            case("1-8"): if(boardRank==8) onEdge=true; break;
            case("8-1"): if(boardRank==1) onEdge=true; break;
            case("A1-H8"): if(boardFile==8 || boardRank==8) onEdge=true; break;
            case("A8-H1"): if(boardFile==8 || boardRank==1) onEdge=true; break;
            case("H1-A8"): if(boardFile==1 || boardRank==8) onEdge=true; break;
            case("H8-A1"): if(boardFile==1 || boardRank==1) onEdge=true; break;
        }
        return onEdge;
    }

    //Move Validation - Logic

    generateDirectionMoves(direction, boardFileFrom, boardRankFrom) { //directions: A-H, H-A, 1-8, 8-1, A1-H8, A8-H1, H1-A8, H8-A1
        const directionMoves = []

        let count = 1;
        let fileDirection = 0;
        let rankDirection = 0;
        let hasPiece = false;

        switch(direction) {
            case("A-H"): fileDirection=1; break;
            case("H-A"): fileDirection=-1; break;
            case("1-8"): rankDirection=1; break;
            case("8-1"): rankDirection=-1; break;
            case("A1-H8"): fileDirection=1; rankDirection=1; break;
            case("A8-H1"): fileDirection=1; rankDirection=-1; break;
            case("H1-A8"): fileDirection=-1; rankDirection=1; break;
            case("H8-A1"): fileDirection=-1; rankDirection=-1; break;
        }

        if(!this.isOnBoardEdge(direction, boardFileFrom, boardRankFrom)) {
            while(!hasPiece) {
                const boardFileTo = boardFileFrom+(count*fileDirection);
                const boardRankTo = boardRankFrom+(count*rankDirection);
                const tileToCheck = this.getChessboard().getTile(boardFileTo, boardRankTo)
                if(tileToCheck.hasPiece!=null) {
                    hasPiece = true
                    if(this.isPieceCapturable(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo)) {
                        directionMoves.push([boardFileTo,boardRankTo])
                    }
                } else {
                    directionMoves.push([boardFileTo,boardRankTo])
                    count++
                }
    
                if(this.isOnBoardEdge(direction, boardFileTo, boardRankTo)) { break }
            }
        }

        return directionMoves;
    }
    generateRookMoves(boardFile,boardRank) {
        const moves =  this.generateDirectionMoves("A-H",boardFile,boardRank).concat(
                        this.generateDirectionMoves("H-A",boardFile,boardRank),
                        this.generateDirectionMoves("1-8",boardFile,boardRank),
                        this.generateDirectionMoves("8-1",boardFile,boardRank));
        return moves
    }
    generateBishopMoves(boardFile,boardRank) {
        const moves = this.generateDirectionMoves("A1-H8",boardFile,boardRank).concat(
                        this.generateDirectionMoves("A8-H1",boardFile,boardRank),
                        this.generateDirectionMoves("H1-A8",boardFile,boardRank),
                        this.generateDirectionMoves("H8-A1",boardFile,boardRank));
        return moves
    }
    generateQueenMoves(boardFile,boardRank) {
        const moves = this.generateDirectionMoves("A-H",boardFile,boardRank).concat(
                      this.generateDirectionMoves("H-A",boardFile,boardRank),
                      this.generateDirectionMoves("1-8",boardFile,boardRank),
                      this.generateDirectionMoves("8-1",boardFile,boardRank),
                      this.generateDirectionMoves("A1-H8",boardFile,boardRank),
                      this.generateDirectionMoves("A8-H1",boardFile,boardRank),
                      this.generateDirectionMoves("H1-A8",boardFile,boardRank),
                      this.generateDirectionMoves("H8-A1",boardFile,boardRank));
        return moves
    }
    generateKnightMoves(boardFile,boardRank) {
        const moves = []

        //possible directions that knight can jump
        const fileOffset = [-2, -1,  1,  2, -2, -1,  1,  2]
        const rankOffset = [-1, -2, -2, -1,  1,  2,  2,  1]

        for(let i=0;i<8;i++) {
            const boardFileToCheck = boardFile+fileOffset[i];
            const boardRankToCheck = boardRank+rankOffset[i];
            if(boardFileToCheck>8 || boardFileToCheck<1 || boardRankToCheck>8 || boardRankToCheck<1) continue; //skip iteration it out of board bounds

            const tileToCheck = this.getChessboard().getTile(boardFileToCheck, boardRankToCheck)

            if(tileToCheck.hasPiece!=null) {
                if(true) {
                    moves.push([boardFileToCheck,boardRankToCheck])
                }
            } else {
                moves.push([boardFileToCheck,boardRankToCheck])
            }
        }
        return moves;
    }



}


// Create "toggle valid moves" highlight method