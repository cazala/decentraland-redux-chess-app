import { createElement, ScriptableScene } from 'metaverse-api'
import store, { squareClick } from './Store'

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
  sceneDidMount() {
    this.eventSubscriber.on('click', event => {
      const { elementId } = event.data
      if (elementId != null) {
        const squareId = getSquareId(elementId)
        const square = store
          .getState()
          .squares.find((square: any) => square.id === squareId)
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
      </entity>
    )
  }

  renderSquare(square: any, index: number) {
    const x = 7 - (index % 8)
    const y = 0
    const z = Math.floor(index / 8)
    const position = { x, y, z }

    let color = (x + z) % 2 === 0 ? '#FFFFFF' : '#000000'
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

  async render() {
    return <scene>{this.renderBoard()}</scene>
  }
}
