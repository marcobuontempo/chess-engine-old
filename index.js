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