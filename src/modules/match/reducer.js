import { INIT_SQUARES } from '../squares/actions'
import { REGISTER_PLAYER, UNREGISTER_PLAYER, CHECKMATE } from './actions'

const STATUS = {
  idle: 'idle',
  started: 'started',
  checkmate: 'checkmate'
}

const initialState = {
  playerWhite: null,
  playerBlack: null,
  status: STATUS.idle
}

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_SQUARES:
      return initialState

    case REGISTER_PLAYER: {
      let { playerWhite, playerBlack, status } = state

      if (playerWhite && playerBlack) {
        return state // both players already registered
      }

      if (playerWhite === action.playerId || playerBlack === action.playerId) {
        return state // this player is already registered
      }

      // register the player
      if (action.isWhite) {
        playerWhite = action.playerId
      } else {
        playerBlack = action.playerId
      }

      if (playerWhite && playerBlack) {
        status = STATUS.started // if both players are registered the game can start
      }

      return {
        playerWhite: playerWhite,
        playerBlack: playerBlack,
        status: status
      }
    }

    case UNREGISTER_PLAYER: {
      const { playerWhite, playerBlack } = state
      if (playerWhite === action.playerId || playerBlack === action.playerId) {
        return initialState // one of the players playing left, so we reset the game
      }
    }

    case CHECKMATE: {
      if (state.status === STATUS.started) {
        return Object.assign({}, state, {
          status: STATUS.checkmate
        })
      }
      return state
    }

    default:
      return state
  }
}
