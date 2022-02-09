const game = new ChessEngine()
game.getChessboard().renderBoard()

//test
game.movePiece(1,1,8,8)
game.getChessboard().setFen(game.getChessboard().createFenString())
game.getChessboard().renderBoard()


//to be implemented
game.addPieceEventListeners()