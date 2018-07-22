const store = require('../../../src/store').default
const {
  initSquares,
  squareClick
} = require('../../../src/modules/squares/actions')
const {
  registerPlayer,
  unregisterPlayer
} = require('../../../src/modules/match/actions')
store.dispatch(initSquares())
export { initSquares, squareClick, registerPlayer, unregisterPlayer }
export default store
