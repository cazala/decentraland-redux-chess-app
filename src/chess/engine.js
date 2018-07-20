/* Combines the outputs of rules and moves.  Takes in squareId and piece to returns array of squares that piece can move.
 * It knows what rules apply to what piece. It works like this:
  * Use moves to get all possible squares (even ones off board)
  * Remove/Add squares based on the outputs of rules
*/
import {
  WHITE,
  BLACK,
  toSquare,
  toCoord,
  fromState,
  virtualMove,
  NO_PIECE_ID
} from './board'
import {
  enforceBoundary,
  enforceLatteralJump,
  enforceDiagnalJump,
  enforceTakenSquare,
  pawnCanTakeDiagnally,
  kingCastle
} from './rules'
import * as mover from './moves'

export const pawn = (x, y, white, board) => {
  let moves = mover.pawn(x, y, white)

  moves = enforceBoundary(moves) // pawn cannot move off board.
  moves = enforceLatteralJump({ x, y }, moves, board) // pawn cannot jump pieces.
  moves = enforceTakenSquare({ x, y }, moves, white, board) // pawn cannot take pieces latteraly, only diagnially.
  moves = enforceTakenSquare({ x, y }, moves, !white, board)

  moves = moves.concat(pawnCanTakeDiagnally({ x, y }, white, board)) // special rule, to add squares that pawns can take.

  return moves
}

export const knight = (x, y, white, board) => {
  let moves = mover.knight(x, y)
  moves = enforceBoundary(moves) // cannot move off board.
  moves = enforceTakenSquare({ x, y }, moves, white, board) // cannot take own pieces
  return moves
}

export const bishop = (x, y, white, board) => {
  let moves = mover.bishop(x, y)
  moves = enforceBoundary(moves)
  moves = enforceDiagnalJump({ x, y }, moves, board) // cannot jump pieces in it's way.
  moves = enforceTakenSquare({ x, y }, moves, white, board) //cannot take own pieces.

  return moves
}

export const rook = (x, y, white, board) => {
  let moves = mover.rook(x, y)
  moves = enforceBoundary(moves)
  moves = enforceLatteralJump({ x, y }, moves, board)
  moves = enforceTakenSquare({ x, y }, moves, white, board)
  return moves
}

export const queen = (x, y, color, board) => {
  return rook(x, y, color, board).concat(bishop(x, y, color, board)) // queen is just a combination of rook and bishop.
}

export const king = (x, y, white, board) => {
  let moves = mover.king(x, y)
  moves = enforceBoundary(moves)
  moves = enforceTakenSquare({ x, y }, moves, white, board)
  moves = moves.concat(kingCastle(white, board)) // add squares when king is allowed to castle.
  return moves
}

// helper decorator function that moves squares to coords for inputs and vice-versa for outputs.
const stateToLogicMap = (calc, color, board) => square => {
  if (!calc) return []
  let { x, y } = toCoord(square)
  let coords = calc(x, y, color === WHITE, board)
  coords = coords.filter(c => {
    let newBoard = virtualMove({ x, y }, c, board)
    return !isKingInCheck(newBoard, color === WHITE)
  })
  return coords.map(toSquare)
}

export const pieceMap = {
  P: pawn,
  p: pawn,
  N: knight,
  n: knight,
  B: bishop,
  b: bishop,
  R: rook,
  r: rook,
  Q: queen,
  q: queen,
  K: king,
  k: king
}

export default state => {
  let board = fromState(state)
  return p =>
    stateToLogicMap(pieceMap[p], p.toUpperCase() === p ? WHITE : BLACK, board)
}

export const doesMovePutKingInCheck = (moves, kingPiece, board) => {
  let row = board.filter(r => r.includes(kingPiece))[0]
  let kingCoord = {
    x: row.indexOf(kingPiece) + 1,
    y: board.indexOf(row) + 1
  }

  return (
    moves.filter(ms => ms.x === kingCoord.x && ms.y === kingCoord.y).length !==
    0
  )
}

export const isKingInCheck = (board, kingColorIsWhite) => {
  let check = false

  let kingPiece = kingColorIsWhite ? 'K' : 'k'
  board.forEach((r, i) =>
    r.forEach((p, j) => {
      if (check) return
      if (p.toLowerCase() === 'k') return
      if (p === NO_PIECE_ID) return

      if (kingColorIsWhite && p.toUpperCase() === p) return
      if (!kingColorIsWhite && p.toLowerCase() === p) return
      let moves = pieceMap[p](j + 1, i + 1, p.toUpperCase() === p, board)
      check = doesMovePutKingInCheck(moves, kingPiece, board)
    })
  )

  return check
}
