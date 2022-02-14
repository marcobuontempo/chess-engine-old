const game = new ChessEngine()
game.updateBoardDisplay()

//test
// game.getChessboard().setFen(game.getChessboard().createFenStringComplete())
// game.getChessboard().renderBoard()


//to be implemented as a startgame method
game.getChessboard().setFen(game.getChessboard().getFen())
game.getChessboard().setFenHalfMove(game.getChessboard().getFenHalfMove()-1)
game.getChessboard().setFenFullMove(game.getChessboard().getFenFullMove()-1)
game.toggleTurn()
game.setupNextTurn()
game.updateBoardDisplay()

class ChessGame {
    constructor(fen) {
        
    }
}


/* 
    *Check game completed : 
        if no valid moves ? isKingInCheck = checkmate : stalemate
        if halfmove = 50 ? draw

    *Implement 3-fold repetition check :
        method to return the move ff/rf/ft/rt
        store last 6? moves in array
        if moves 1==3==5 && 2==4==6 ? draw
    
    *Endgame :
        remove all event listeners
        animate rainbow colours on board
        board finishes on winning colour
*/
