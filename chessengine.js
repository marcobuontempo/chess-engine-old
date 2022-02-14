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
            const pseudoMoves = this.generatePiecePseudoMoves(newBoardFile,newBoardRank)
            const validMoves = this.generateValidMoves(newBoardFile,newBoardRank,pseudoMoves)
            this.setSelectedPieceMoves(validMoves)
            this.toggleValidMovesHighlight(validMoves)
        } else if (previousSelectedValue==newSelectedValue) {
            //if same piece is re-selected, disable the piece's selection
            this.setSelectedTile([])
            newTileHtml.classList.toggle("selected-tile")
            const pseudoMoves = this.generatePiecePseudoMoves(newBoardFile,newBoardRank)
            const validMoves = this.generateValidMoves(newBoardFile,newBoardRank,pseudoMoves)
            this.setSelectedPieceMoves(validMoves)
            this.toggleValidMovesHighlight(validMoves)
        } else if (previousSelectedValue!=newSelectedValue && newSelectedTileObject.hasPiece!=null && newSelectedTileObject.hasPiece.pieceColour==this.getCurrentTurn()) {    
            //if new valid piece is selected, un-select previous and re-select new
            this.setSelectedTile(newBoardFile,newBoardRank)
            previousTileHtml.classList.toggle("selected-tile")
            newTileHtml.classList.toggle("selected-tile")

            this.toggleValidMovesHighlight(this.getSelectedPieceMoves())

            const pseudoMoves = this.generatePiecePseudoMoves(newBoardFile,newBoardRank)
            const validMoves = this.generateValidMoves(newBoardFile,newBoardRank,pseudoMoves)
            this.setSelectedPieceMoves(validMoves)
            this.toggleValidMovesHighlight(validMoves)
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
    convertCoordinateToFileNumber(coordinate) {
        if(coordinate.length < 2) { return }
        let fileNumber
        switch(coordinate[0].toUpperCase()) {
            case "A": fileNumber=1; break;
            case "B": fileNumber=2; break;
            case "C": fileNumber=3; break;
            case "D": fileNumber=4; break;
            case "E": fileNumber=5; break;
            case "F": fileNumber=6; break;
            case "G": fileNumber=7; break;
            case "H": fileNumber=8; break;
        }
        return fileNumber 
    }
    toggleTurn() {
        const newColour = this.getCurrentTurn()=="white" ? "black" : "white"
        this.setCurrentTurn(newColour)
    }


    //Move Validation - Logic
    generateValidMoves(boardFileFrom,boardRankFrom,pseudoMoves) {
        const validMoves = []
        pseudoMoves.forEach(move => { if(this.isLegalMove(boardFileFrom,boardRankFrom,move[0],move[1])) validMoves.push(move) })
        return validMoves
    }
    generatePiecePseudoMoves(boardFileFrom,boardRankFrom) {
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

            //en passant
            const enPassantMove = this.calculateEnPassantMove(boardFile,boardRank,boardRankSingle,pieceColour)
            if(enPassantMove!=null) { moves.push(enPassantMove) }
        }
        return moves
    }
    generateKingMoves(boardFile,boardRank) {
        const moves = []

        //Regular Moves
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

        //Castling
        const kingColour = this.getChessboard().getTile(boardFile,boardRank).hasPiece.pieceColour
        if(this.canKingCastle(kingColour,"king")) { moves.push([boardFile+2,boardRank]) }
        if(this.canKingCastle(kingColour,"queen")) { moves.push([boardFile-2,boardRank]) }

        return moves
    }

    //Castle Moves
    canKingCastle(kingColour,castleSide) {
        const fenCastleString = this.getChessboard().getFenCastle()

        if(kingColour=="white" && castleSide=="king") { //castle move to determine
            if(fenCastleString.includes("K")) { //check fen that castle is available
                if(this.getChessboard().getTile(6,1).hasPiece==null && this.getChessboard().getTile(7,1).hasPiece==null) { //check no pieces between castle movement
                    if(this.isLegalMove(5,1,6,1) && this.isLegalMove(5,1,7,1)) { return true } //return if move is legal
                }
            } 
        } else if (kingColour=="white" && castleSide=="queen") {
            if(fenCastleString.includes("Q")) {
                if(this.getChessboard().getTile(4,1).hasPiece==null && this.getChessboard().getTile(3,1).hasPiece==null  && this.getChessboard().getTile(2,1).hasPiece==null) {
                    if(this.isLegalMove(5,1,4,1) && this.isLegalMove(5,1,3,1)) { return true }
                }
            }
        } else if (kingColour=="black" && castleSide=="king") {
            if(fenCastleString.includes("k")) {
                if(this.getChessboard().getTile(6,8).hasPiece==null && this.getChessboard().getTile(7,8).hasPiece==null) {
                    if(this.isLegalMove(5,8,6,8) && this.isLegalMove(5,8,7,8)) { return true }
                }
            }
        } else if (kingColour="black" && castleSide=="queen") {
            if(fenCastleString.includes("q")) {
                if(this.getChessboard().getTile(4,8).hasPiece==null && this.getChessboard().getTile(3,8).hasPiece==null && this.getChessboard().getTile(2,8).hasPiece==null) {
                    if(this.isLegalMove(5,8,4,8) && this.isLegalMove(5,8,3,8)) { return true }
                }
            }
        }
        return false //otherwise return false
    }
    moveRookCastle(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) {
        if(boardFileFrom==5 && boardRankFrom==1) {
            if(boardFileTo==7 && boardRankTo==1) {
                const rookFrom = this.getChessboard().getTile(8,1).hasPiece
                this.getChessboard().setTilePiece(8,1,null) 
                this.getChessboard().setTilePiece(6,1,rookFrom) 
            } else if(boardFileTo==3 && boardRankTo==1) {
                const rookFrom = this.getChessboard().getTile(1,1).hasPiece
                this.getChessboard().setTilePiece(1,1,null) 
                this.getChessboard().setTilePiece(4,1,rookFrom)
            }
        } else if(boardFileFrom==5 && boardRankFrom==8) {
            if(boardFileTo==7 && boardRankTo==8) {
                const rookFrom = this.getChessboard().getTile(8,8).hasPiece
                this.getChessboard().setTilePiece(8,8,null) 
                this.getChessboard().setTilePiece(6,8,rookFrom)
            } else if(boardFileTo==3 && boardRankTo==8) {
                const rookFrom = this.getChessboard().getTile(1,8).hasPiece
                this.getChessboard().setTilePiece(1,8,null) 
                this.getChessboard().setTilePiece(4,8,rookFrom)
            }
        }
    }
    updateCastleRights(boardFileFrom,boardRankFrom) {
        const moveFrom = `${boardFileFrom}${boardRankFrom}`
        switch(moveFrom) {
            case "11": this.getChessboard().updateFenCastleString("white","queen"); break;
            case "81": this.getChessboard().updateFenCastleString("white","king"); break;
            case "51": this.getChessboard().updateFenCastleString("white","both"); break;
            case "18": this.getChessboard().updateFenCastleString("black","queen"); break;
            case "88": this.getChessboard().updateFenCastleString("black","king"); break;
            case "58": this.getChessboard().updateFenCastleString("black","both"); break;
        }
    }


    //En Passant Moves
    calculateEnPassantMove(boardFile, boardRank, boardRankSingle, pieceColour) {
        if((pieceColour=="white" && boardRank==5) || (pieceColour=="black" && boardRank==4)) {
            const coordinate = this.getChessboard().getFenEnPassant()
            const enPassantFile = this.convertCoordinateToFileNumber(coordinate)
            const enPassantRank = Number(coordinate[1])
            if((boardFile+1==enPassantFile || boardFile-1==enPassantFile) && boardRankSingle==enPassantRank) {
                return [enPassantFile,enPassantRank]
            }
        }
        return null
    }
    captureEnPassantPiece(boardFileTo,boardRankTo,piece) {
        if(piece.pieceType=="pawn") {
            const coordinate = this.getChessboard().getFenEnPassant()
            const enPassantFile = this.convertCoordinateToFileNumber(coordinate)
            const enPassantRank = Number(coordinate[1])
            if(boardFileTo==enPassantFile && boardRankTo==enPassantRank) {
                const offset = piece.pieceColour=="white" ? -1 : 1
                this.getChessboard().setTilePiece(enPassantFile,enPassantRank+offset,null)
            }
        }
    }

    //King is Checked
    generateAllAvailableMoves(colourToCheck) {
        const attackedTiles = []
        this.getChessboard().getBoardTiles().forEach(tile => {
            if(tile.hasPiece!=null && tile.hasPiece.pieceColour==colourToCheck) {
                const pieceMoves = this.generatePiecePseudoMoves(tile.boardFile,tile.boardRank)
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


    //Pawn Promotion
    promotePawn(pieceFrom,boardFileTo,boardRankTo) {
        const colour = pieceFrom.pieceColour
        if((colour=="white" && boardRankTo==8) || (colour=="black" && boardRankTo==1)) {
            const pieceType = "queen"
            const fenType = colour=="white" ? "Q" : "q"
            const promotedPiece = this.getChessboard().createPiece(colour,pieceType,fenType)
            this.getChessboard().setTilePiece(boardFileTo,boardRankTo,promotedPiece)
        }
    }


    //Move Piece
    movePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) {
        const pieceFrom = this.getChessboard().getTile(boardFileFrom,boardRankFrom).hasPiece
        this.getChessboard().setTilePiece(boardFileFrom,boardRankFrom,null) //remove existing piece from first tile
        this.getChessboard().setTilePiece(boardFileTo,boardRankTo,pieceFrom) //set existing piece onto second tile

        //Castling Logic
        this.moveRookCastle(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) //moves rook if castle move
        this.updateCastleRights(boardFileFrom,boardRankFrom) //updates castling validity

        //En Passant Logic
        this.captureEnPassantPiece(boardFileTo,boardRankTo,pieceFrom)
        this.getChessboard().updateFenEnPassant(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo,pieceFrom)

        //Pawn Promotion
        this.promotePawn(pieceFrom,boardFileTo,boardRankTo)
    }
    handleMovePiece(boardFileTo,boardRankTo) { 
        const boardFileFrom = this.getSelectedTile()[0]
        const boardRankFrom = this.getSelectedTile()[1]
        this.getSelectedPieceMoves().forEach(validMove => {
            const boardFileValid = validMove[0]
            const boardRankValid = validMove[1]
            if(boardFileTo==boardFileValid && boardRankTo==boardRankValid) {
                const pieceFrom = this.getChessboard().getTile(boardFileFrom,boardRankFrom).hasPiece
                const pieceTo = this.getChessboard().getTile(boardFileTo,boardRankTo).hasPiece
                this.movePiece(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo)
                this.setupNextTurn(pieceFrom,pieceTo)
                this.updateBoardDisplay()
            }
        })
    }


    //Validate Piece Moves
    isLegalMove(boardFileFrom,boardRankFrom,boardFileTo,boardRankTo) {
        let validMove = true

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
        validMove = validMove==true && !testEngine.isKingInCheck(currentColour)

        return validMove
    }


    //Make Turn
    setupNextTurn(pieceFrom,pieceTo) {
        //toggle turn
        this.toggleTurn()

        //get turn colours
        const currentColour = this.getCurrentTurn()
        const opponentColour = this.getNextTurn()

        //update fen
        this.getChessboard().updateFenStringComplete(currentColour,pieceFrom,pieceTo)

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
}

/* TO-DO
    *Add method to get all opposition's attacked tiles -- DONE
    *Add method to check whether king is in check (i.e. is in attacking tile) -- DONE
    *Add method to highlight if king is in check -- DONE
    *Add method to create testEngine and validate a move -- DONE
    *Apply move validation to each psuedo-legal move -- DONE
    *Castle logic - check if castle available (from Fen string) - check if moving squares are unattacked - add to available moves - handlemovepiece= if move piece file/rowFrom is default, and file/rowTo is castle square, complete csatle (move rook & king) -- DONE
    *En Passant logic -- DONE
    *create fenPosition, fenEnPassant, fenCastling. combine in createFen -- DONE
    *create fenHalfMove and fenFullMove counters -- DONE
    *add pawn promotion
    *Add method to check game completed -> if no valid moves -> isKingInCheck = checkmate : stalemate

    *Game must begin with endTurn()
*/