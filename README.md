# Decentraland Redux Chess

The purpose of this repo is to serve as an example of how to port a redux game to a Decentraland scene.

![chess - ported](https://user-images.githubusercontent.com/2781777/43051195-4daaa90e-8dec-11e8-9ce1-997e8b86d1b6.gif)

You can clone this repo and follow the [installation guide](https://github.com/cazala/decentraland-redux-chess-app#installation) to test it, or you can follow the [tutorial](https://github.com/cazala/decentraland-redux-chess-app#tutorial) and build it yourself.

The original game is [@zackpudil](https://github.com/zackpudil)'s [redux-chess-app](https://github.com/zackpudil/redux-chess-app), I just forked it and ported it to Decentraland.

## Installation

You will need to have Decentraland's SDK installed. If you haven't installed it yet, run this command:

```bash
npm install -g decentraland
```

Then clone the repo from github:

```bash
git clone https://github.com/cazala/decentraland-redux-chess-app.git
cd decentraland-redux-chess-app
```

Finally, run these commands from the repo's folder to install the dependencies and build it:

```bash
npm install
cd scene
npm install
cd server
npm install
npm run build
```

## Preview the scene

Once you've installed everything, you can see the scene in action. Since this is a remote scene, a single scene state runs on a separate server. You must first start this server by running the following command from the `decentraland-redux-chess-app/scene/server` directory:

```
npm start
```

Let this terminal window keep executing so that the server keeps running. Open a second terminal window and go to the `decentraland-redux-chess-app/scene` directory and start the SDK preview:

```
dcl preview
```

A new tab in your browser should open with our chess scene.

If you want to play the original 2D redux-based chess game that we worked with to build this scene, go to the root directory (`decentraland-redux-chess-app`) and run this:

```
npm run server
```

Then open a new browser tab and point it to `http://localhost:8080/`.

# Tutorial

The idea of this tutorial is to show you how to take an existing redux game and port it to Decentraland. The game I chose is [@zackpudil](https://github.com/zackpudil)'s [redux-chess-app](https://github.com/zackpudil/redux-chess-app), which looks like this:

![chess - redux](https://user-images.githubusercontent.com/2781777/43051194-472c015e-8dec-11e8-8a71-a352a97953c8.gif)

**Prerequisites**

This tutorial assumes you are on a unix machine (or at least using a unix-like terminal), with `git`, `npm` and Decentraland's SDK installed. If you haven't installed them yet, follow these steps:

- Install [git](https://git-scm.com/book/en/v1/Getting-Started-Installing-Git).

- Install [nvm](http://nvm.sh) and then run `nvm use stable` to install `npm`.

- Once you have `npm` installed, run `npm install -g decentraland` to install Decentraland's SDK.

**Fast-Forward**

Each step in this tutorial is represented on [its own release](https://github.com/cazala/decentraland-redux-chess-app/releases) on this repo, so you can fast-foward to any step using `git clone` like this:

```bash
git clone --branch step-0 https://github.com/cazala/decentraland-redux-chess-app.git --depth=1
```

Just replace the `step-0` with the step you want to jump to.

# Step 0: Initialize Scene

The fist step is to clone the repo from the original redux game that we want to work with:

```bash
git clone https://github.com/zackpudil/redux-chess-app
cd redux-chess-app
```

Then install its dependencies by running the following command from the repo's folder:

```bash
npm install
```

Now we can initialize our decentraland scene in a folder inside this same repo. We'll create a `scene` directory and initialize the SDK in it.

```bash
mkdir scene
cd scene
dcl init
```

The SDK will prompt you with a few questions in order to initialize the scene. It will ask you which type of scene is this going to be, **make sure you select Multiplayer** (the third option).

It will also ask you which parcel(s) comprise this scene. If you don't have any parcels that's okay, you can enter any coordinates like `0,0` since we are running this scene locally.

Now that we have initialized our scene, we are (almost) ready to start porting the game.

First, we need to replace the aliased imports with relative ones, because the former ones are not compatible with Decentraland's SDK, like this:

```diff
-import { groupMovesByColor } from '~/modules/game/selectors';
+import { groupMovesByColor } from '../modules/game/selectors';
```

If you don't want to deal with all those replaces and just want to jump into the fun stuff, you can skip this step running the
fast-forward command from below:

---

**Diff:** to see the full diff of changes for this step check [this commit](https://github.com/cazala/decentraland-redux-chess-app/commit/8338a8d99332ae555ce786110480133cd621e9b9).

**Fast-Forward**: to jump to the end of this step, run `git clone --branch step-0 https://github.com/cazala/decentraland-redux-chess-app.git --depth=1`

---

# Step 1: Port game to the Decentraland scene

Now we can start porting the chess game to our scene. Inside the `scene` directory that we created on the previous step, there's a `server` folder, let's move into it:

```bash
cd server
```

We can start by deleting the `State.ts` file, since the game state will now reside in the `redux` store.

```
rm State.ts
```

Now let's add a `Store.ts` file where we will import the `redux` store, initialize it, and then export it with all the actions that we will use from the scene:

```ts
// scene/server/Store.ts
const store = require('../../../src/store').default
const {
  initSquares,
  squareClick
} = require('../../../src/modules/squares/actions')
store.dispatch(initSquares())
export { initSquares, squareClick }
export default store
```

Then we need to modify `ConectedClient.ts` so all the clients get updated when there's a change in the redux store:

```diff ts
 import RemoteScene from './RemoteScene'
+import store from './Store'

 export const connectedClients: Set<RemoteScene> = new Set()

-export function updateAll() {
+store.subscribe(() => {
   connectedClients.forEach(function each(client) {
     client.forceUpdate()
   })
-}
+})
```

We can now create an `assets` folder inside our `scene` directory to place the models for all the pieces:

```bash
cd ..
mkdir assets
```

You can get the assets [from here](https://github.com/cazala/decentraland-redux-chess-app/tree/master/scene/assets).

Once all the models have been placed in that folder, we can go back to the server:

```
cd ..
cd server
```

Finally we need to modify `RemoteScene.tsx` so that it imports the redux store, gets its state, and uses it to render the board and all the pieces in the scene.

So let's start by removing the import of `State.ts` and replace it with `Store.ts`

```diff
// scene/server/RemoteScene.tsx
-import { setState, getState } from './State'
+import store, { squareClick } from './Store'
```

Now let's replace the `render` function with the following

```tsx
async render() {
  return <scene>{this.renderBoard()}</scene>
}
```

This will render the output of the `renderBoard` method. Let's define this method:

```tsx
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
```

That will render a base entity and position it on the scene, then it will get the `squares` array from the redux store's state and run a `map` operation over it, running the `renderSquare` method for each square.

This method will receive each `square` and its index (which goes from 0 to 63). Each `square` contains the state for a particular tile on the board. The state indicates:

- If there's a chess piece on the tile, and which
- If the tile is selected
- If the tile is highlighted
- If the tile is in check

We can then use this information to render the board on the scene.

The first thing we need to do is convert the 1-dimentional index (0 to 63) into 3D coords (x, y, z).

```tsx
renderSquare(square: any, index: number) {
  const x = 7 - (index % 8)
  const y = 0
  const z = Math.floor(index / 8)
  const position = { x, y, z }
```

The second thing we have to do is figure out the color of the tile, which will alternate bewtween black and white, unless the tile is in a special state (highlighted, selected or in check):

```tsx
let color = (x + z) % 2 === 0 ? '#FFFFFF' : '#000000'
if (square.selected) {
  color = '#7FFF00'
} else if (square.highlighted) {
  color = square.pieceId !== '_' ? '#FF0000' : '#FFFF00'
} else if (square.check) {
  color = '#FFA500'
}
```

When the square is selected we will make it green. If the square is highlighted we compare the `pieceId` against `'_'` because that means "no piece". So if there's no piece that means a square where a player can move to (shown in yellow), and if there's a piece in that square, then it means the player can eat it (highlighted in red). If the square is in check we will make it orange.

Before rendering the actual tile, let's add a `modelsById` map at the top of our file that maps each `pieceId` to the corresponding model, like this:

```tsx
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
```

Now we can write the last part of the `renderSquare` method:

```tsx
const tileSize = { x: 1, y: 0.1, z: 1 }
return (
  <entity position={position}>
    <box color={color} scale={tileSize} id={`${square.id}-tile`} />
    {square.pieceId in modelsById ? (
      <gltf-model src={modelsById[square.pieceId]} id={`${square.id}-piece`} />
    ) : null}
  </entity>
)
```

We are rendering one `<entity>` in the position we computed before, and inside we are rendering a `<box>` that represents the tile, and if the `square.pieceId` is inside our `modelsById` map, we also render a `<glft-model>` that represents the piece.

We add `id`s to both the `<box>` and the `<gltf-model>` because we will use them to listen to click events, in order to do that we need to modify the current `eventSubscriber`. Let's start by removing the call to `setState`:

```diff
sceneDidMount() {
  this.eventSubscriber.on('click', event => {
-   setState({ isDoorClosed: !getState().isDoorClosed })
  })
}
```

We can get the `elementId` from that `event` object that receives the listener:

```tsx
const { elementId } = event.data
if (elementId != null) {
  // dispatch redux action
}
```

Now, that `elementId` can have either a `-tile` suffix or a `-piece` suffix. We need to get the `squareId` from that `elementId` by removing the suffix. Let's add this helper function at the top of the file:

```tsx
const getSquareId = (elementId: string) => elementId.split('-')[0]
```

That will take the `elementId`, split it by the dash, and return the first part.

So let's use it to get the `squareId` and dispatch a `squareClick` action:

```tsx
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
```

Now we are all set!

Let's build the server and test it out:

```
npm run build
npm start
```

That will start our server, so on a different terminal go to the `scene` directory and start the SDK preview

```
cd ..
dcl preview
```

Go to `http://localhost:8000` and you should see the board rendered on the screen and should be able to click on the piece to move them, in the same way as the original game!

![chess - ported](https://user-images.githubusercontent.com/2781777/43051195-4daaa90e-8dec-11e8-9ce1-997e8b86d1b6.gif)

---

**Diff:** to see the full diff of changes for this step check [this commit](https://github.com/cazala/decentraland-redux-chess-app/commit/61f4ae3a8bb0b0a4095fd052f11f846b9c199864).

**Fast-Forward**: to jump to the end of this step run `git clone --branch step-1 https://github.com/cazala/decentraland-redux-chess-app.git --depth=1`

---

# Step 2: Multiplayer!

It's no fun to play against yourself, so in this last step we will modify the server so it keeps track of which clients are playing, keep the status of the match, and let only the clients who are playing move the pieces (and only let them move their own pieces).

So the first thing we will do is adding a `match` module to the redux game, under `src/modules/match`.

Now let's add three actions: `registerPlayer`, `unregisterPlayer` and `checkmate`:

```js
// src/modules/match/actions.js
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
```

And let's add a reducer to handle those actions

```js
// src/modules/match/reducer.js
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
      // ...
    }

    case UNREGISTER_PLAYER: {
      // ...
    }

    case CHECKMATE: {
      // ...
    }

    default:
      return state
  }
}
```

So in this part of the state we will keep the game `status`, which can be `idle`, `started` or `checkmate`. We will also store the `id` of the clients that are using either the black pieces or the white ones. The already existing `INIT_SQUARES` action will reset to the initial state, and now we will see how to handle each of the new actions, starting with registering the players:

```js
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
```

If both players are already registered, we will ignore this action.

If this player is already registered, we will ignore this action.

We check the `action.isWhite` to know to which player register this client, and if both players have registered we can change the `status` to `started`.

And that's all we have to do to register a player. Now let's see how to unregister them:

```js
case UNREGISTER_PLAYER: {
  const { playerWhite, playerBlack } = state
  if (playerWhite === action.playerId || playerBlack === action.playerId) {
    return initialState // one of the players playing left, so we reset the game
  }
}
```

We just check if the client that wants to unregister is one of the players, and if so, we reset the game to the `idle` state.

Finally, we handle the "checkmate":

```js
case CHECKMATE: {
  if (state.status === STATUS.started) {
    return Object.assign({}, state, {
      status: STATUS.checkmate
    })
  }
  return state
}
```

So now our server is capable of registering which players are playing. We can plug this new reducer into our store (this is `src/store`):

```diff
 import squares from './modules/squares/reducer'
 import pieces from './modules/pieces/reducer'
 import game from './modules/game/reducer'
+import match from './modules/match/reducer'

 const rootReducer = combineReducers({
   squares: squares, // main ui slice of the state.
   takenPieces: pieces, // taken pieces list.
   game: game, // move recording.
+  match: match // game match status
 })
```

The last thing we need to do on the redux side is modifying the Analysis Middleware to handle the "checkmate":

```diff
// src/modules/middleware/analysis-middleware.js
import {
   addPiece,
   removePiece,
-  checkSquare
+  checkSquare,
+  initSquares
 } from '../../modules/squares/actions'
 import {
   wasKingCastle,
   wasQueenCastle,
   getSquaresOfPiece
 } from '../../chess/analysis'
 import engine, { isKingInCheck } from '../../chess/engine'
+import { checkmate } from '../match/actions'

 export default store => next => action => {
   switch (action.type) {
   // ...
       if (isKingInCheck(board, !isWhite)) {
         next(checkSquare(getSquaresOfPiece(isWhite ? 'k' : 'K', board)[0]))
         next(checkSquare(action.toSquare))
+        const squares = store.getState().squares
+        const squaresWithPiecesFromPlayerInCheck = squares.filter(
+          square =>
+            square.pieceId !== '_' &&
+            (isWhite ? square.color === 'piece_black' : 'piece_white')
+        )
+        const amountOfValidMoves = squaresWithPiecesFromPlayerInCheck.reduce(
+          (moves, square) =>
+            moves + engine(squares)(square.pieceId)(square.id).length,
+          0
+        )
+        if (amountOfValidMoves === 0) {
+          if (store.getState().match.status === 'started') {
+            next(checkmate())
+            setTimeout(() => next(initSquares()), 10000)
+          }
+        }
       }
```

Basically what we do is, after detecting a king is in check, we filter all squares with pieces from the player who's in check:

```js
const squares = store.getState().squares
const squaresWithPiecesFromPlayerInCheck = squares.filter(
  square =>
    square.pieceId !== '_' &&
    (isWhite ? square.color === 'piece_black' : 'piece_white')
)
```

Then we run the game engine on all those squares, and compute the amount of valid moves that the player has:

```js
const amountOfValidMoves = squaresWithPiecesFromPlayerInCheck.reduce(
  (moves, square) => moves + engine(squares)(square.pieceId)(square.id).length,
  0
)
```

If the amount is 0, then we know it is a checkmate, so we can dispatch a `checkmate()` action, followed by a game reset 10 seconds later:

```js
if (amountOfValidMoves === 0) {
  if (store.getState().match.status === 'started') {
    next(checkmate())
    setTimeout(() => next(initSquares()), 10000)
  }
}
```

And that's all we had to do on the redux side, so let's go back to the server (`scene/server`)

Let's modify the `Server.ts` so it dispatches an `unregisterPlayer()` action when a client disconects:

```diff
// scene/server/Server.ts
import { connectedClients } from './ConnectedClients'
import { WebSocketTransport } from 'metaverse-api'
import RemoteScene from './RemoteScene'
+import store, { unregisterPlayer } from './Store'

 // ...

 wss.on('connection', function connection(ws, req) {
   connectedClients.add(client)
-  ws.on('close', () => connectedClients.delete(client))
+  ws.on('close', () => {
+    connectedClients.delete(client)
+    store.dispatch(unregisterPlayer(client.id))
+  })
```

Finally we need to modify `RemoteScene.tsx` to handle both game states (game started or idle), allow user registration, and prevent users from playing when it's not their turn.

The first thing we need to do is to add an `id` to each client (this will be used as the player id), that we will genereate randomly:

```diff
export default class Chess extends ScriptableScene {
+  public id: number = Math.random()
```

Now let's replace the `render` method with the following:

```tsx
async render() {
  const status = store.getState().match.status
  return (
    <scene>
      {status === 'idle' ? this.renderIdle() : this.renderBoard()}
    </scene>
  )
}
```

That will read the game `status` from the redux store and render either the `idle` state or the board.

We can now define `renderIdle`. We will render a white queen and a black queen on the scene, and a text that reads "Choose your color". We will assign the ids `register-white` and `register-black` to the queens so we can listen to click events on them. When any of the players is registered we will render that queen in `y: 1` (in the air) to indicate that it has been selected already:

```tsx
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
```

Now we only need to modify the `eventSubscriber` to dispatch the register actions and to prevent dispatching the click actions when it's not the player's turn.

First we will read what turn is it (black or white) and both player ids from the state:

```tsx
this.eventSubscriber.on('click', event => {
  const { elementId } = event.data
  const state = store.getState()
  const {
    game: { whiteTurn },
    match: { playerWhite, playerBlack }
  } = state
```

Now we can check if it is a click on any of the "register" queen and dispatch a `registerPlayer` action. The first player who registers will also dispatch an `initSquares` to reset the board from a previous game:

```tsx
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
}
```

Finally if the `elementId` doesn't match any of the "register" queens we can dispatch a `squareClick` event, but only after checking that it is this client's turn:

```tsx
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
```

Finally let's add a `<text>` that reads who's turn is it, and announces when there's a "checkmate".

For this we will add a `renderMessage` method and call it from `renderBoard`:

```diff
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
+        {this.renderMessage()}
       </entity>
     )
   }

+  renderMessage() {
+    const state = store.getState()
+    const { whiteTurn } = state.game
+    const { playerWhite, playerBlack, status } = state.match
+    const yourTurn =
+      (whiteTurn && playerWhite === this.id) ||
+      (!whiteTurn && playerBlack === this.id)
+    const theirTurn =
+      (whiteTurn && playerBlack === this.id) ||
+      (!whiteTurn && playerWhite === this.id)
+
+    return status === 'checkmate' ? (
+      <text
+        value="Checkmate!"
+        color="#FF0000"
+        position={{ x: 3.5, y: 2, z: 3.5 }}
+        width={3}
+        billboard={7}
+      />
+    ) : yourTurn ? (
+      <text
+        value="It's your turn!"
+        color="#000000"
+        position={{ x: 3.5, y: 2, z: 3.5 }}
+        width={2}
+        billboard={7}
+      />
+    ) : theirTurn ? (
+      <text
+        value="It's your opponent's turn"
+        color="#AAAAAA"
+        position={{ x: 3.5, y: 2, z: 3.5 }}
+        width={2}
+        billboard={7}
+      />
+    ) : null
+  }
```

And that's it! Now two players can start a match and play against each other. Any other connected client will be able to see the game but they won't be able to move any piece:

![chess - multiplayer](https://user-images.githubusercontent.com/2781777/43075877-859114ea-8e58-11e8-88f3-26b8a01bcf53.gif)

Remember you will need to re-build the server and restart it:

```bash
npm run build
npm start
```

---

**Diff:** to see the full diff of changes for this step check [this commit](https://github.com/cazala/decentraland-redux-chess-app/commit/d67179baa87962cdef6de65835bf4e43418de1fa).

**Fast-Forward**: to jump to the end of this step run `git clone --branch step-2 https://github.com/cazala/decentraland-redux-chess-app.git --depth=1`

---
