import { createElement, ScriptableScene } from 'metaverse-api'
import store, { initSquares, squareClick, registerPlayer } from './Store'

const modelsById: { [key: string]: string } = {
  B: 'assets/LP Bishop_White.gltf',
  b: 'assets/LP Bishop_Black.gltf',
  K: 'assets/LP King_White.gltf',
  k: 'assets/LP King_Black.gltf',
  N: 'assets/LP Knight_White.gltf',
  n: 'assets/LP Knight_Black.gltf',
  P: 'assets/LP Pawn_White.gltf',
  p: 'assets/LP Pawn_Black.gltf',
  Q: 'assets/LP Queen_White.gltf',
  q: 'assets/LP Queen_Black.gltf',
  R: 'assets/LP Rook_White.gltf',
  r: 'assets/LP Rook_Black.gltf'
}

const getSquareId = (elementId: string) => elementId.split('-')[0]

export default class Chess extends ScriptableScene {
  public id: number = Math.random()

  sceneDidMount() {
    this.eventSubscriber.on('click', event => {
      const { elementId } = event.data
      const state = store.getState()
      const {
        game: { whiteTurn },
        match: { playerWhite, playerBlack }
      } = state
      if (elementId === 'register-white') {
        if (!playerBlack) {
          store.dispatch(initSquares()) // let the first player who registers init the board
        }
        store.dispatch(registerPlayer(this.id, true))
      } else if (elementId === 'register-black') {
        if (!playerWhite) {
          store.dispatch(initSquares()) // let the first player who registers init the board
        }
        store.dispatch(registerPlayer(this.id, false))
      } else if (elementId != null) {
        // players can click squares only on their turn
        if (whiteTurn && this.id !== playerWhite) return
        if (!whiteTurn && this.id !== playerBlack) return

        // click on square
        const squareId = getSquareId(elementId)
        const square = state.squares.find(
          (square: any) => square.id === squareId
        )
        store.dispatch(squareClick(square.id, square.pieceId, square.color))
      }
    })
  }

  renderBoard() {
    return (
      <entity
        position={{
          x: 1.5,
          y: 0,
          z: 1.5
        }}
      >
        {store.getState().squares.map(this.renderSquare)}
        {this.renderMessage()}
      </entity>
    )
  }

  renderMessage() {
    const state = store.getState()
    const { whiteTurn } = state.game
    const { playerWhite, playerBlack, status } = state.match
    const yourTurn =
      (whiteTurn && playerWhite === this.id) ||
      (!whiteTurn && playerBlack === this.id)
    const theirTurn =
      (whiteTurn && playerBlack === this.id) ||
      (!whiteTurn && playerWhite === this.id)

    return status === 'checkmate' ? (
      <text
        value="Checkmate!"
        color="#FF0000"
        position={{ x: 3.5, y: 2, z: 3.5 }}
        width={3}
        billboard={7}
      />
    ) : yourTurn ? (
      <text
        value="It's your turn!"
        color="#000000"
        position={{ x: 3.5, y: 2, z: 3.5 }}
        width={2}
        billboard={7}
      />
    ) : theirTurn ? (
      <text
        value="It's your opponent's turn"
        color="#AAAAAA"
        position={{ x: 3.5, y: 2, z: 3.5 }}
        width={2}
        billboard={7}
      />
    ) : null
  }

  renderSquare(square: any, index: number) {
    const x = 7 - (index % 8)
    const y = 0
    const z = Math.floor(index / 8)
    const position = { x, y, z }

    let color = (x + z) % 2 !== 0 ? '#FFFFFF' : '#000000'
    if (square.selected) {
      color = '#7FFF00'
    } else if (square.highlighted) {
      color = square.pieceId !== '_' ? '#FF0000' : '#FFFF00'
    } else if (square.check) {
      color = '#FFA500'
    }

    const tileSize = { x: 1, y: 0.1, z: 1 }

    return (
      <entity position={position}>
        <box color={color} scale={tileSize} id={`${square.id}-tile`} />
        {square.pieceId in modelsById ? (
          <gltf-model
            src={modelsById[square.pieceId]}
            id={`${square.id}-piece`}
          />
        ) : null}
      </entity>
    )
  }

  renderIdle() {
    const { playerWhite, playerBlack } = store.getState().match
    return (
      <entity>
        <gltf-model
          src={modelsById['Q']}
          id="register-white"
          position={{ x: 3.5, y: playerWhite ? 1 : 0, z: 5 }}
        />
        <gltf-model
          src={modelsById['q']}
          id="register-black"
          position={{ x: 6.5, y: playerBlack ? 1 : 0, z: 5 }}
        />
        <text
          value="Choose your color"
          color="#000000"
          position={{ x: 5, y: 2, z: 5 }}
          width={3}
          billboard={7}
        />
      </entity>
    )
  }

  async render() {
    const status = store.getState().match.status
    return (
      <scene>
        {status === 'idle' ? this.renderIdle() : this.renderBoard()}
      </scene>
    )
  }
}
