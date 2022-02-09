/*
Default FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

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

class ChessBoard {
    constructor(fen) {
        this._fen = fen || "rnbqkbnr/ppppqppp/8/8/8/8/PPP2PPP/RNBQKBNR w KQkq - 0 1",
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
    getPieceFromFen(boardFile, boardRank) {
        // starting position FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const rankFenString = this.getFen().split(" ")[0].split("/")[8-boardRank]

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
    getTile(boardFile, boardRank) {
        return this._tiles[boardFile-1][boardRank-1]
    }
    getTilePiece(boardFile, boardRank) {
        return this._tiles[boardFile][boardRank].hasPiece;
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
    }
    setTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece) {
        this._tiles[boardFile-1][boardRank-1] = this.createTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece);
    }
    setBoardTiles(newBoardTiles) {
        this._boardTiles = newBoardTiles;
    }

    //Create Board
    createPiece(boardFile, boardRank) {
        const fenPiece = this.getPieceFromFen(boardFile,boardRank)
        let pieceColour = null
        let pieceType = null
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
        }
        
        return {
            pieceColour,
            pieceType,
            pieceIcon: this.getPieceIcon(fenPiece)
        }
    }
    createTileColour(boardFile) {
        let colour = boardFile%2==0 ? "white" : "black";
        colour = (boardFile%2==0 && colour=="white") ? "black" : "white";
        return colour;
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
            let tileColour = (file%2==0) ? "white" : "black";
            for(let boardRank=1; boardRank<=8; boardRank++) {
                const hasPiece = this.createPiece(boardFile,boardRank)
                const tileCoordinate = this.createTileCoordinate(boardFile,boardRank)
                const tile = this.createTile(tileCoordinate,tileColour,boardFile,boardRank,hasPiece);
                file.push(tile);
                tileColour = tileColour=="white"?"black":"white";
            }
            tiles.push(file);
        }
        this.setBoardTiles(tiles)
    }
    
    //Generate FEN
    createFenCharacter(boardFile, boardRank) {
        const hasPiece = this.getTilePiece(boardFile,boardRank)
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
    createFenString() {
        const fenArray = [];
        let fenString;

        let rankNotation = [];
        for(let boardRank=0; boardRank<8; boardRank++) {
            let emptyTileCount = 0;
            for(let boardFile=0; boardFile<8; boardFile++) {
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
        fenString = fenArray.reverse().join("/");
        return fenString;
    }
}