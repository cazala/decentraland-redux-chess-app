const store = require('../../../src/store').default
const {
  initSquares,
  squareClick
} = require('../../../src/modules/squares/actions')
store.dispatch(initSquares())
export { initSquares, squareClick }
export default store
