class ChessEngine {
    constructor(fen) {
        this._chessboard = new Chessboard(fen),  //the game board to operate within
        this._currentTurn = "white",    //current turn's colour
        this._selectedTile = [],    //the currently selected piece
        this._currentMoves = [],    //the tiles that the current player is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._oppositionMoves = [],    //the tiles that the opposition is currently attacking. e.g. [ [file,row], [file,row], ... ]
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
    getCurrentMoves() {
        return this._currentMoves;
    }
    getOppositionMoves() {
        return this._oppositionMoves;
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
    setCurrentMoves(newMoves) {
        this._currentMoves = newMoves;
    }
    setOppositionMoves(newMoves) {
        this._oppositionMoves = newMoves;
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
        } else if (previousSelectedValue==newSelectedValue) {
            //if same piece is re-selected, disable the piece's selection
            this.setSelectedTile([])
            newTileHtml.style.backgroundColor = newTileHtml.dataset.tileColour        
        } else if (previousSelectedValue!=newSelectedValue && newSelectedTileObject.hasPiece!=null && newSelectedTileObject.hasPiece.pieceColour==this.getCurrentTurn()) {    
            //if new valid piece is selected, un-select previous and re-select new
            this.setSelectedTile(newBoardFile,newBoardRank)
            previousTileHtml.style.backgroundColor = previousTileHtml.dataset.tileColour
            newTileHtml.style.backgroundColor = "red"
        } else {
            //otherwise, move piece
        }
    }
    handleMovePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) { 

    }
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
            case("A-H"): if(boardFile=="H") onEdge=true; break;
            case("H-A"): if(boardFile=="A") onEdge=true; break;
            case("1-8"): if(boardRank=="8") onEdge=true; break;
            case("8-1"): if(boardRank=="1") onEdge=true; break;
            case("A1-H8"): if(boardFile=="H" || boardRank=="8") onEdge=true; break;
            case("A8-H1"): if(boardFile=="H" || boardRank=="1") onEdge=true; break;
            case("H1-A8"): if(boardFile=="A" || boardRank=="8") onEdge=true; break;
            case("H8-A1"): if(boardFile=="A" || boardRank=="1") onEdge=true; break;
        }
        return onEdge;
    }

    //Move Validation - Logic
    generateMoves(boardFileFrom,boardRankFrom) {
        const pieceType = this.getChessboard().getTile(boardFileFrom,boardRankFrom).hasPiece.pieceType
        let validMoves = [];

        switch(pieceType) {
            case("rook"):
                validMoves = this.generateRookMoves(tileCoordinateFrom)
                break;
            case("bishop"):
                validMoves = this.generateBishopMoves(tileCoordinateFrom)
                break;
            case("queen"):
                validMoves = this.generateQueenMoves(tileCoordinateFrom)
                break;
            case("king"):
                validMoves = this.generateKingMoves(tileCoordinateFrom)
                break;
            case("knight"):
                validMoves = this.generateKnightMoves(tileCoordinateFrom)
                break;
            case("pawn"):
                validMoves = this.generatePawnMoves(tileCoordinateFrom)
                break;
        }

        return validMoves;
    }
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
}