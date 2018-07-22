export const REGISTER_PLAYER = 'chess/match/register_player'
export const UNREGISTER_PLAYER = 'chess/match/unregister_player'
export const CHECKMATE = 'chess/match/checkmate'

export const registerPlayer = (playerId, isWhite) => ({
  type: REGISTER_PLAYER,
  playerId,
  isWhite
})

export const unregisterPlayer = playerId => ({
  type: UNREGISTER_PLAYER,
  playerId
})

export const checkmate = () => ({
  type: CHECKMATE
})
