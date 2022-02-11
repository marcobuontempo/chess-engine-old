class ChessEngine {
    constructor(fen) {
        this._chessboard = new Chessboard(fen),  //the game board to operate within
        this._currentTurn = "white",    //current turn's colour
        this._selectedTile = [],    //the currently selected piece
        this._selectedPieceMoves = [], //the tiles that the current selected piece is attacking
        this._currentTurnMoves = [],    //the tiles that the current player is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._oppositionTurnMoves = [],    //the tiles that the opposition is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._currentKingIsInCheck = false,  //whether the current colour's king is in check
        this._whiteKingPosition = [],
        this._blackKingPosition = [],
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
    getOppositionTurnMoves() {
        return this._oppositionTurnMoves;
    }
    getCurrentKingIsInCheck() {
        return this._currentKingIsInCheck;
    }
    getKingPosition(kingColour) {
        if(kingColour=="white") {
            return this._whiteKingPosition;
        } else {
            return this._blackKingPosition;
        }
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
        this._currentKingIsInCheck = isChecked;
    }
    setKingPosition(kingColour,position) {
        if(kingColour=="white") {
            this._whiteKingPosition = position
        } else {
            this._blackKingPosition = position
        }
    }

    //Piece Interaction
    addPieceEventListeners() {
        const boardTiles = document.querySelectorAll(".board-tile")
        boardTiles.forEach((boardTile) => {
            boardTile.addEventListener("click", this.eventHandlers.clickTile)
        })
    }
    removePieceEventListeners() {
        const boardTiles = document.querySelectorAll(".board-tile")
        boardTiles.forEach((boardTile) => {
            boardTile.removeEventListener("click", this.eventHandlers.clickTile)
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
            newTileHtml.classList.toggle("selected-tile")
            const pieceMoves = this.generatePieceMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves(pieceMoves)
            this.toggleValidMovesHighlight(pieceMoves)
        } else if (previousSelectedValue==newSelectedValue) {
            //if same piece is re-selected, disable the piece's selection
            this.setSelectedTile([])
            newTileHtml.classList.toggle("selected-tile")
            const pieceMoves = this.generatePieceMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves([])
            this.toggleValidMovesHighlight(pieceMoves)
        } else if (previousSelectedValue!=newSelectedValue && newSelectedTileObject.hasPiece!=null && newSelectedTileObject.hasPiece.pieceColour==this.getCurrentTurn()) {    
            //if new valid piece is selected, un-select previous and re-select new
            this.setSelectedTile(newBoardFile,newBoardRank)
            previousTileHtml.classList.toggle("selected-tile")
            newTileHtml.classList.toggle("selected-tile")

            this.toggleValidMovesHighlight(this.getSelectedPieceMoves())

            const pieceMoves = this.generatePieceMoves(newBoardFile,newBoardRank)
            this.setSelectedPieceMoves(pieceMoves)
            this.toggleValidMovesHighlight(pieceMoves)
        } else {
            //otherwise, move piece
            this.handleMovePiece(newBoardFile,newBoardRank)
        }
    }
    toggleValidMovesHighlight(pieceMoves) {
        pieceMoves.forEach(validMove => {
            const boardFile = validMove[0]
            const boardRank = validMove[1]
            const validTileHtml = document.querySelector(`[data-board-file='${boardFile}'][data-board-rank='${boardRank}']`)
            validTileHtml.classList.toggle("highlighted-tile")
        })
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
    toggleTurn() {
        const newColour = this.getCurrentTurn()=="white" ? "black" : "white"
        this.setCurrentTurn(newColour)
    }


    //Move Validation - Logic
    generatePieceMoves(boardFileFrom,boardRankFrom) {
        const pieceType = this.getChessboard().getTile(boardFileFrom,boardRankFrom).hasPiece.pieceType
        let validMoves = [];

        switch(pieceType) {
            case("rook"): validMoves=this.generateRookMoves(boardFileFrom,boardRankFrom); break;
            case("bishop"): validMoves=this.generateBishopMoves(boardFileFrom,boardRankFrom); break;
            case("queen"): validMoves=this.generateQueenMoves(boardFileFrom,boardRankFrom); break;
            case("king"): validMoves=this.generateKingMoves(boardFileFrom,boardRankFrom); break;
            case("knight"): validMoves=this.generateKnightMoves(boardFileFrom,boardRankFrom); break;
            case("pawn"): validMoves=this.generatePawnMoves(boardFileFrom,boardRankFrom); break;
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
                if(this.isPieceCapturable(boardFile,boardRank,boardFileToCheck,boardRankToCheck)) {
                    moves.push([boardFileToCheck,boardRankToCheck])
                }
            } else {
                moves.push([boardFileToCheck,boardRankToCheck])
            }
        }
        return moves;
    }
    generatePawnMoves(boardFile,boardRank) {
        const moves = []

        const pieceColour = this.getChessboard().getTile(boardFile,boardRank).hasPiece.pieceColour;
        const colourOffset = pieceColour=="white" ? 1 : -1; //1 for white (up), -1 for black (down)
        
        const boardRankSingle = boardRank+colourOffset
        const boardRankDouble = boardRank+(colourOffset*2)
        const boardFileCaptureLeft = boardFile-1
        const boardFileCaptureRight = boardFile+1

        if(boardRankSingle>=1 && boardRankSingle<=8) {
            let tileToCheck = this.getChessboard().getTile(boardFile, boardRankSingle)
            //single pawn push
            if(tileToCheck.hasPiece==null) { 
                moves.push([boardFile, boardRankSingle])
                //double pawn push
                if((pieceColour=="white" && boardRank==2) || (pieceColour=="black" && boardRank==7)) {
                    const tileToCheck = this.getChessboard().getTile(boardFile, boardRankDouble)
                    if(tileToCheck.hasPiece==null) moves.push([boardFile, boardRankDouble])
                }
            }
            //left capture
            if(boardFileCaptureLeft>=1 && boardFileCaptureLeft<=8) {
                tileToCheck = this.getChessboard().getTile(boardFileCaptureLeft, boardRankSingle)
                if(tileToCheck.hasPiece!=null && this.isPieceCapturable(boardFile,boardRank,boardFileCaptureLeft,boardRankSingle)) moves.push([boardFileCaptureLeft, boardRankSingle])
            }
            //right capture
            if(boardFileCaptureRight>=1 && boardFileCaptureRight<=8) {
                tileToCheck = this.getChessboard().getTile(boardFileCaptureRight, boardRankSingle)
                if(tileToCheck.hasPiece!=null && this.isPieceCapturable(boardFile,boardRank,boardFileCaptureRight,boardRankSingle)) moves.push([boardFileCaptureRight, boardRankSingle])
            }
        }
        return moves
    }
    generateKingMoves(boardFile,boardRank) {
        const moves = []

        const fileOffset = [-1, -1, -1,  0,  0,  1,  1,  1]
        const rankOffset = [-1,  0,  1, -1,  1, -1,  0,  1]

        for(let i=0; i<8; i++) {
            const boardFileToCheck = boardFile+fileOffset[i];
            const boardRankToCheck = boardRank+rankOffset[i];
            if(boardFileToCheck>8 || boardFileToCheck<1 || boardRankToCheck>8 || boardRankToCheck<1) continue; //skip iteration it out of board bounds
            const tileToCheck = this.getChessboard().getTile(boardFileToCheck, boardRankToCheck)

            if(tileToCheck.hasPiece==null) {
                moves.push([boardFileToCheck,boardRankToCheck])
            } else {
                if(this.isPieceCapturable(boardFile,boardRank,boardFileToCheck,boardRankToCheck)) moves.push([boardFileToCheck,boardRankToCheck])
            }
        }
        return moves
    }


    //Move Piece
    movePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) {
        const pieceFrom = this.getChessboard().getTile(boardFileFrom,boardRankFrom).hasPiece
        this.getChessboard().setTilePiece(boardFileFrom,boardRankFrom,null) //remove existing piece from first tile
        this.getChessboard().setTilePiece(boardFileTo,boardRankTo,pieceFrom) //set existing piece onto second tile
    }
    handleMovePiece(boardFileTo,boardRankTo) { 
        const boardFileFrom = this.getSelectedTile()[0]
        const boardRankFrom = this.getSelectedTile()[1]
        this.getSelectedPieceMoves().forEach(validMove => {
            const boardFileValid = validMove[0]
            const boardRankValid = validMove[1]
            if(boardFileTo==boardFileValid && boardRankTo==boardRankValid) {
                this.movePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo)
                this.setupNextTurn()
                this.updateBoardDisplay()
            }
        })
    }


    //Make Turn
    setupNextTurn() {
        //toggle turn
        this.toggleTurn()

        //get turn colours
        const currentColour = this.getCurrentTurn()
        const opponentColour = this.getNextTurn()

        //update fen
        const newFen = this.getChessboard().createFenString()
        this.getChessboard().setFen(newFen)

        //reset all values to default
        this.setSelectedTile([])
        this.setSelectedPieceMoves([])
        this.setCurrentTurnMoves([])

        //set attacking tiles
        const currentMoves = this.generateAllAvailableMoves(currentColour)
        this.setCurrentTurnMoves(currentMoves)
        const opponentMoves = this.generateAllAvailableMoves(opponentColour)
        this.setOppositionTurnMoves(opponentMoves)

        //set king positions
        this.setKingPosition("white",this.findKingsPosition("white"))
        this.setKingPosition("black",this.findKingsPosition("black"))

        //is current king in check
        this.setCurrentKingIsInCheck(this.isKingInCheck(currentColour))
    }
    updateBoardDisplay() {
        //re-render board
        this.getChessboard().renderBoard()

        //highlight king if checked
        this.highlightCheckedKing()

        //update event listeners
        this.removePieceEventListeners()
        this.addPieceEventListeners()
    }


    //King is Checked
    generateAllAvailableMoves(colourToCheck) {
        const attackedTiles = []
        this.getChessboard().getBoardTiles().forEach(tile => {
            if(tile.hasPiece!=null && tile.hasPiece.pieceColour==colourToCheck) {
                const pieceMoves = this.generatePieceMoves(tile.boardFile,tile.boardRank)
                pieceMoves.forEach(move => attackedTiles.push(move))
            }
        })
        return attackedTiles
    }
    findKingsPosition(colourToCheck) {
        const kingsPosition = []
        this.getChessboard().getBoardTiles().forEach(tile => {
            if(tile.hasPiece!=null && tile.hasPiece.pieceType=="king" && tile.hasPiece.pieceColour==colourToCheck) {
                kingsPosition.push(tile.boardFile)
                kingsPosition.push(tile.boardRank)
            }
        })
        return kingsPosition
    }
    isKingInCheck(colourToCheck) {
        let kingIsInCheck = false
        const kingsFile = this.getKingPosition(colourToCheck)[0]
        const kingsRank = this.getKingPosition(colourToCheck)[1]
        const opponentColour = colourToCheck=="white" ? "black" : "white"
        const opponentsAttackingMoves = this.generateAllAvailableMoves(opponentColour)
        
        opponentsAttackingMoves.forEach(move => {
            if(kingsFile==move[0] && kingsRank==move[1]) {
                kingIsInCheck = true
            } 
        })
        return kingIsInCheck
    }
    highlightCheckedKing() {
        if(this.getCurrentKingIsInCheck()) {
            const kingPosition = this.getKingPosition(this.getCurrentTurn())
            const kingsTileHtml = document.querySelector(`[data-board-file='${kingPosition[0]}'][data-board-rank='${kingPosition[1]}']`)
            kingsTileHtml.style.backgroundColor = "orange"
        }
    }


    //Validate Piece Moves
    isLegalMove(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) {
        //create temporary test chessboard
        const currentFen = this.getChessboard().getFen()
        const testEngine = new ChessEngine(currentFen)
        testEngine.getChessboard().createBoardTiles()

        //make move
        testEngine.movePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo)
        testEngine.toggleTurn()
        testEngine.setupNextTurn()

        //check if king is in check
        const currentColour = this.getCurrentTurn()
        return !testEngine.isKingInCheck(currentColour)
    }
}

/* TO-DO
    *Add method to get all opposition's attacked tiles -- DONE
    *Add method to check whether king is in check (i.e. is in attacking tile) -- DONE
    *Add method to highlight if king is in check -- DONE
    *Add method to create testEngine and validate a move -- DONE
    *Apply move validation to each psuedo-legal move
    *Add method to check game completed -> if no valid moves -> isKingInCheck = checkmate : stalemate

    *Game must begin with endTurn()
*/