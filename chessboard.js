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
            return {
                pieceColour,
                pieceType,
                pieceIcon: this.getPieceIcon(fenPiece)
            }
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
                const hasPiece = this.createPiece(boardFile,boardRank)
                const tile = this.createTile(tileCoordinate,tileColour,boardFile,boardRank,hasPiece);
                file.push(tile);
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

    //Render Board
    createBoardHtml() {
        this.createBoardTiles()
        let boardHtml = []
        for(let boardFile=1; boardFile<=8; boardFile++) {
            const fileHtml = []
            this.getBoardFile(boardFile).forEach(tile => {
                let pieceHtml = "";
                let pieceType
                let pieceColour
                if(tile.hasPiece) {
                    pieceType = tile.hasPiece.pieceType;
                    pieceColour = tile.hasPiece.pieceColour;
                    const pieceColourAlt = tile.hasPiece.pieceColour=="white" ? "black" : "white"
                    pieceHtml = 
                    `<p class="board-piece" draggable="true" data-piece-type=${tile.hasPiece.pieceType} data-piece-colour=${tile.hasPiece.pieceColour}
                    style="z-index:10; width:100%; height:100%; text-align:center; font-size:42px; color:${tile.hasPiece.pieceColour}; text-shadow:0 0 1px ${pieceColourAlt}, 0 0 1px ${pieceColourAlt}, 0 0 1px ${pieceColourAlt}, 0 0 1px ${pieceColourAlt}; margin:0; padding:0; position:absolute; cursor:default;">
                        ${tile.hasPiece.pieceIcon}
                    </p>`
                }
    
                const tileHtml = 
                `<div class="board-tile" data-tile-coordinate=${tile.tileCoordinate} data-tile-file=${tile.boardFile} data-tile-rank=${tile.boardRank} data-tile-colour=${tile.tileColour} data-has-piece-type=${pieceType} data-has-piece-colour=${pieceColour}
                style="z-index:1; height:50px; width:50px; background-color:${tile.tileColour}; outline:1px solid red; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-start; position: relative;">
                    ${pieceHtml}
                    <p style="z-index:10; color:${tile.tileColour}; filter:invert(1); pointer-events:none; user-select:none; font-size:0.6em; padding:0.2em; margin:0;">
                        ${tile.tileCoordinate}
                    </p>
                </div>`

                fileHtml.push(tileHtml)
            })
            boardHtml.push(`<div style="display:flex; flex-direction:column;">${fileHtml.reverse().join("")}</div>`)
        }
        return boardHtml.join("");
    }
    renderBoard() {
        const boardHtml = this.createBoardHtml()
        const chessboard = document.querySelector("#chessboard")
        chessboard.innerHTML = boardHtml; 
    }
}