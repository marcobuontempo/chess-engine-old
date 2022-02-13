const game = new ChessEngine()
game.getChessboard().renderBoard()

//test
// game.getChessboard().setFen(game.getChessboard().createFenStringComplete())
// game.getChessboard().renderBoard()


//to be implemented as a startgame method
game.getChessboard().setFen(game.getChessboard().getFen())
game.toggleTurn()
game.setupNextTurn()
game.updateBoardDisplay()