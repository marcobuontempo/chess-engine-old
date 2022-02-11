const game = new ChessEngine()
game.getChessboard().renderBoard()

//test
game.movePiece(4,1,4,4)
game.getChessboard().setFen(game.getChessboard().createFenString())
game.getChessboard().renderBoard()


//to be implemented as a startgame method
game.toggleTurn()
game.endTurn()