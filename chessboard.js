/*
Default FEN : rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

Board-
    R1  08  08  08  08  08  08  08  08              A8  B8  C8  D8  E8  F8  G8  H8              r   n   b   q   k   b   n   r  
    R2  07  07  07  07  07  07  07  07              A7  B7  C7  D7  E7  F7  G7  H7              p   p   p   p   p   p   p   p
    R3  06  06  06  06  06  06  06  06              A6  B6  C6  D6  E6  F6  G6  H6              0   0   0   0   0   0   0   0
    R4  05  05  05  05  05  05  05  05              A5  B5  C5  D5  E5  F5  G5  H5              0   0   0   0   0   0   0   0
    R5  04  04  04  04  04  04  04  04      =       A4  B4  C4  D4  E4  F4  G4  H4      =       0   0   0   0   0   0   0   0
    R6  03  03  03  03  03  03  03  03              A3  B3  C3  D3  E3  F3  G3  H3              0   0   0   0   0   0   0   0
    R7  02  02  02  02  02  02  02  02              A2  B2  C2  D2  E2  F2  G2  H2              P   P   P   P   P   P   P   P
    R8  01  01  01  01  01  01  01  01              A1  B1  C1  D1  E1  F1  G1  H1              R   N   B   Q   K   B   N   R
        F1  F2  F3  F4  F5  F6  F7  F8

Pieces-
    rR : Rook
    nN : Knight
    bB : Bishop
    qQ : Queen
    kK : King
    pP : Pawn

    * UPPERCASE : white
    * lowercase : black

*/

class Chessboard {
    constructor(fen) {
        this._fen = fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        this._fenPosition = this._fen.split(" ")[0],
        this._fenTurn = "",
        this._fenCastle = "",
        this._fenEnPassant = "",
        this._fenHalfMove = "",
        this._fenFullMove = "",
        this._boardTiles = [],
        this._pieceIcons = {
                k: "♚",
                q: "♛",
                r: "♜",
                b: "♝",
                n: "♞",
                p: "♟",
                K: "♚",
                Q: "♛",
                R: "♜",
                B: "♝",
                N: "♞",
                P: "♟"
            }
    }

    //Getters
    getFen() {
        return this._fen;
    }
    getFenPieceNotation(boardFile, boardRank) {
        const rankFenString = this.getFenPosition().split("/")[8-boardRank]

        let rankFullString = ""
        for(let i=0; i<rankFenString.length; i++) {
            const fenCharacter = rankFenString[i]
            if (isNaN(fenCharacter)) {
                rankFullString += fenCharacter
            } else {
                rankFullString += "0".repeat(fenCharacter)
            }
        }
        
        const fenPiece = rankFullString[boardFile-1]   
        if(fenPiece!="0") {
            return fenPiece
        } else {
            return null
        }
    }
    getFenPosition() {
        return this._fenPosition;
    }
    getFenTurn() {
        return this._fenTurn;
    }
    getFenCastle() {
        return this._fenCastle;
    }
    getFenEnPassant() {
        return this._fenEnPassant;
    }
    getFenHalfMove() {
        return this._fenHalfMove;
    }
    getFenFullMove() {
        return this._fenFullMove;
    }
    getTile(boardFile, boardRank) {
        return this._boardTiles[boardFile-1][boardRank-1];
    }
    getPieceIcon(fenPiece) {
        return this._pieceIcons[fenPiece];
    }
    getBoardFile(boardFile) {
        return this._boardTiles[boardFile-1]
    }
    getBoardRow(boardRow) {
        const row = []
        for(let boardFile=0;boardFile<8;boardFile++) {
            row.push(this._boardTiles[boardFile][boardRow-1])
        }
        return row;
    }
    getBoardTiles() {
        const tiles = []
        this._boardTiles.forEach(file => {
            file.forEach(tile => {
                tiles.push(tile)
            })
        })
        return tiles;
    }

    //Setters
    setFen(newFen) {
        this._fen = newFen;
        const splitFen = newFen.split(" ")
        this._fenPosition = splitFen[0]
        this._fenTurn = splitFen[1]
        this._fenCastle = splitFen[2]
        this._fenEnPassant = splitFen[3]
        this._fenHalfMove = splitFen[4]
        this._fenFullMove = splitFen[5]
    }
    setFenPosition(newPosition) {
        this._fenPosition = newPosition;
    }
    setFenTurn(newTurn) {
        this._fenTurn = newTurn;
    }
    setFenCastle(newCastle) {
        this._fenCastle = newCastle;
    }
    setFenEnPassant(newEnPassant) {
        this._fenEnPassant = newEnPassant;
    }
    setFenHalfMove(newHalfMove) {
        this._fenHalfMove = newHalfMove;
    }
    setFenFullMove(newFullMove) {
        this._fenFullMove = newFullMove;
    }
    setTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece) {
        this._boardTiles[boardFile-1][boardRank-1] = this.createTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece);
    }
    setTilePiece(boardFile,boardRank,newPiece) {
        this._boardTiles[boardFile-1][boardRank-1].hasPiece = newPiece;
    }
    setBoardTiles(newBoardTiles) {
        this._boardTiles = newBoardTiles;
    }

    //Create Board
    createPiece(pieceColour,pieceType,fenPiece) {
        return {
            pieceColour,
            pieceType,
            pieceIcon: this.getPieceIcon(fenPiece)
        }
    }
    createPieceFromFen(boardFile, boardRank) {
        const fenPiece = this.getFenPieceNotation(boardFile,boardRank)
        let pieceColour
        let pieceType
        if(fenPiece) {
            pieceColour = fenPiece==fenPiece.toUpperCase() ? "white" : "black"
            switch(fenPiece.toLowerCase()) {
                case "r": pieceType = "rook"; break;
                case "n": pieceType = "knight"; break;
                case "b": pieceType = "bishop"; break;
                case "q": pieceType = "queen"; break;
                case "k": pieceType = "king"; break;
                case "p": pieceType = "pawn"; break;
            }
            return this.createPiece(pieceColour,pieceType,fenPiece)
            
        } else {
            return null
        }
    }
    createTileColour(boardFile,boardRank) {
        if((boardFile%2==0 && boardRank%2!=0) || (boardFile%2!=0 && boardRank%2==0)) {
            return "white"
        } else {
            return "black"
        }
    }
    createTileCoordinate(boardFile, boardRank) {
        let fileLetter;
        switch(boardFile) {
            case(1): fileLetter="A"; break;
            case(2): fileLetter="B"; break;
            case(3): fileLetter="C"; break;
            case(4): fileLetter="D"; break;
            case(5): fileLetter="E"; break;
            case(6): fileLetter="F"; break;
            case(7): fileLetter="G"; break;
            case(8): fileLetter="H"; break;
        }
        return fileLetter+boardRank;
    }
    createTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece) {
        return {
            tileCoordinate,
            tileColour,
            boardFile,
            boardRank,
            hasPiece
        }
    }
    createBoardTiles() {
        const tiles = [];
        for(let boardFile=1; boardFile<=8; boardFile++) {
            const file = [];
            for(let boardRank=1; boardRank<=8; boardRank++) {
                const tileCoordinate = this.createTileCoordinate(boardFile,boardRank)
                const tileColour = this.createTileColour(boardFile,boardRank);
                const hasPiece = this.createPieceFromFen(boardFile,boardRank)
                const tile = this.createTile(tileCoordinate,tileColour,boardFile,boardRank,hasPiece);
                file.push(tile);
            }
            tiles.push(file);
        }
        this.setBoardTiles(tiles)
    }
    
    //Generate FEN
    createFenCharacter(boardFile, boardRank) {
        const hasPiece = this.getTile(boardFile,boardRank).hasPiece
        let pieceType
        let pieceColour
        let fenTile = ""

        if(hasPiece) {
            pieceType = hasPiece.pieceType
            pieceColour = hasPiece.pieceColour
            switch(pieceType.toLowerCase()) {
                case "rook": fenTile += "r"; break;
                case "knight": fenTile += "n"; break;
                case "bishop": fenTile += "b"; break;
                case "queen": fenTile += "q"; break;
                case "king": fenTile += "k"; break;
                case "pawn": fenTile += "p"; break;
            }
            if(pieceColour == "white") { fenTile = fenTile.toUpperCase() }
        }
        return fenTile;
    }
    updateFenPositionString() {
        const fenArray = [];
        let newFenPosition;

        let rankNotation = [];
        for(let boardRank=1; boardRank<=8; boardRank++) {
            let emptyTileCount = 0;
            for(let boardFile=1; boardFile<=8; boardFile++) {
                const fenCharacter = this.createFenCharacter(boardFile,boardRank)
                if(fenCharacter) {
                    if(emptyTileCount>0) {
                        rankNotation.push(emptyTileCount)
                        emptyTileCount = 0
                    }
                    rankNotation.push(fenCharacter)
                } else {
                    emptyTileCount += 1
                }
            }
            if(emptyTileCount>0) {
                rankNotation.push(emptyTileCount)
            }
            fenArray.push(rankNotation.join(""));
            rankNotation = [];
        }
        newFenPosition = fenArray.reverse().join("/");
        
        this.setFenPosition(newFenPosition);
        return newFenPosition
    }
    updateFenTurn(turnColour) {
        let newFenTurn;
        if(turnColour=="white") {
            newFenTurn = "w"
        } else if (turnColour=="black") {
            newFenTurn = "b"
        }
        this.setFenTurn(newFenTurn);
        return newFenTurn
    }
    updateFenCastleString(colour,castleSide) {
        let newFenCastle = this.getFenCastle()

        if(colour=="white") {
            switch(castleSide) {
                case "king": newFenCastle = newFenCastle.replace("K",""); break;
                case "queen": newFenCastle = newFenCastle.replace("Q",""); break;
                case "both": newFenCastle = newFenCastle.replace("KQ",""); break;
            }
        } else if(colour=="black") {
            switch(castleSide) {
                case "king": newFenCastle = newFenCastle.replace("k",""); break;
                case "queen": newFenCastle = newFenCastle.replace("q",""); break;
                case "both": newFenCastle = newFenCastle.replace("kq",""); break;
            }
        }

        if(newFenCastle.length==0) { newFenCastle="-" }

        this.setFenCastle(newFenCastle)
    }
    updateFenEnPassant(boardFileFrom,boardRankFrom, boardFileTo, boardRankTo, piece) {
        if(piece.pieceType=="pawn") {
            if((boardRankFrom==2 && boardRankTo==4) || (boardRankFrom==7 && boardRankTo==5)) {
                const offset = piece.pieceColour=="white" ? 1 : -1
                const coordinate = this.createTileCoordinate(boardFileFrom,boardRankFrom+offset).toLowerCase()
                this.setFenEnPassant(coordinate)
                return
            }
        }
        this.setFenEnPassant("-")
    }
    updateFenHalfMove(pieceFrom, pieceTo) {
        if(pieceFrom==null) { 
            return Number(this.getFenHalfMove()) + 1 
        } else if(pieceTo!=null || pieceFrom.pieceType=="pawn") {
            this.setFenHalfMove(0)
            return 0
        } else {
            const newHalfMove = Number(this.getFenHalfMove()) + 1
            this.setFenHalfMove(newHalfMove)
            return newHalfMove
        }
    }
    updateFenFullMove(colour) {
        if(colour=="white") {
            const newFullMove = Number(this.getFenFullMove()) + 1
            this.setFenFullMove(newFullMove)
            return newFullMove
        } else {
            return this.getFenFullMove()
        }
    }
    updateFenStringComplete(turnColour,pieceFrom,pieceTo) {
        const fenPosition = this.updateFenPositionString()
        const fenTurn = this.updateFenTurn(turnColour)
        const fenCastle = this.getFenCastle()
        const fenEnPassant = this.getFenEnPassant()
        const fenHalfMove = this.updateFenHalfMove(pieceFrom,pieceTo)
        const fenFullMove = this.updateFenFullMove(turnColour)

        const newFen = `${fenPosition} ${fenTurn} ${fenCastle} ${fenEnPassant} ${fenHalfMove} ${fenFullMove}`
        this.setFen(newFen)
    }

    //Render Board
    createBoardHtml() {
        this.createBoardTiles()
        let boardHtml = []
        for(let boardFile=1; boardFile<=8; boardFile++) {
            const fileHtml = []
            this.getBoardFile(boardFile).forEach(tile => {
                let pieceHtml = "";
                if(tile.hasPiece) {
                    pieceHtml = 
                    `<p class="board-piece" draggable="true" data-piece-type=${tile.hasPiece.pieceType} data-piece-colour=${tile.hasPiece.pieceColour}>
                        ${tile.hasPiece.pieceIcon}
                    </p>`
                }
    
                const tileHtml = 
                `<div class="board-tile" data-tile-coordinate=${tile.tileCoordinate} data-tile-colour=${tile.tileColour} data-board-file=${tile.boardFile} data-board-rank=${tile.boardRank}>
                    ${pieceHtml}
                    <p class="tile-coordinate">
                        ${tile.tileCoordinate}
                    </p>
                </div>`

                fileHtml.push(tileHtml)
            })
            boardHtml.push(`<div class="board-file"">${fileHtml.reverse().join("")}</div>`)
        }
        return boardHtml.join("");
    }
    renderBoard() {
        const boardHtml = this.createBoardHtml()
        const chessboard = document.querySelector("#chessboard")
        chessboard.innerHTML = boardHtml; 
    }
}