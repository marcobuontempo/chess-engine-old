class ChessEngine {
    constructor(fen) {
        this._chessboard = new Chessboard(fen),  //the game board to operate within
        this._currentTurn = "white",    //current turn's colour
        this._selectedPiece,    //the currently selected piece
        this._currentMoves = [],    //the tiles that the current player is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._oppositionMoves = [],    //the tiles that the opposition is currently attacking. e.g. [ [file,row], [file,row], ... ]
        this._currentKingIsInCheck = false  //whether the current colour's king is in check
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
    getSelectedPiece() {
        return this._selectedPiece;
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
    setSelectedPiece(newSelected) {
        this._selectedPiece = newSelected;
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
}