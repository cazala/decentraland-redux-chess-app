import { combineReducers, createStore, compose, applyMiddleware } from 'redux'
import chess from './modules/middleware/chess-middleware'
import analysis from './modules/middleware/analysis-middleware'
import click from './modules/middleware/click-middleware'

import squares from './modules/squares/reducer'
import pieces from './modules/pieces/reducer'
import game from './modules/game/reducer'

const rootReducer = combineReducers({
  squares: squares, // main ui slice of the state.
  takenPieces: pieces, // taken pieces list.
  game: game // move recording.
})

let composedMiddleware = compose(
  applyMiddleware(click), // handles click events on the squares.
  applyMiddleware(chess), // handles the move, take and route actions.
  applyMiddleware(analysis) // handles specialty cases like castling, checking and pawn promotion.
)

if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  composedMiddleware = compose(
    composedMiddleware,
    window.__REDUX_DEVTOOLS_EXTENSION__()
  )
}

export default createStore(rootReducer, composedMiddleware)
