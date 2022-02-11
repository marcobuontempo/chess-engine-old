const game = new ChessEngine()
game.getChessboard().renderBoard()

//test
game.getChessboard().setFen(game.getChessboard().createFenString())
game.getChessboard().renderBoard()


//to be implemented as a startgame method
game.toggleTurn()
game.setupNextTurn()
game.updateBoardDisplay()