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
        this._tiles = [],
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
    getTiles() {
        return this._tiles;
    }

    //Setters
    setFen(newFen) {
        this._fen = newFen;
    }
    setTile(tileCoordinate, tileColour, boardFile, boardRank, hasPiece) {
        this._tiles[boardFile-1][boardRank-1] = {
            tileCoordinate,
            tileColour,
            boardFile,
            boardRank,
            hasPiece
        }
    }
    setTiles(newTiles) {
        this._tiles = newTiles;
    }

}