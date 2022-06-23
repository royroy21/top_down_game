import geckos from "@geckos.io/server";

const io = geckos()

io.listen() // default port is 9208

const maxNumberOfPlayers = 4;
const games = {}
const playerStartingPositions = {
    player1: {x: 200, y: 200},
    player2: {x: 300, y: 200},
    player3: {x: 400, y: 200},
    player4: {x: 500, y: 200},
}

io.onConnection(channel => {
    channel.onDisconnect(() => {
        console.log(`${channel.id} got disconnected`)
    })

    channel.on("chat message", data => {
        console.log("Chat message: ", data);
        const parsedData = JSON.parse(data);
        switch (parsedData.type) {
            case "connect":
                connect(parsedData, channel);
                break;
            case "updatePlayerPosition":
                updatePlayerPosition(parsedData, channel);
                break;
        }
    })
})

const connect = (data, channel) => {
    const gameExists = Object.keys(games).includes(data.gameID)
    if (!gameExists) {
        games[data.gameID] = {
            player1: {
                id: data.playerID,
                animation: data.animation,
                flipX: data.flipX,
                x: playerStartingPositions.player1.x,
                y: playerStartingPositions.player1.y,
            }
        }
        console.log(`Created game ${data.gameID}. Adding player ${data.playerID}`);
        io.room(channel.roomId).emit(
            "chat message",
            JSON.stringify(games[data.gameID]),
        )
    } else {
        const gameState = games[data.gameID];

        // Check if existing player. EG player is reconnecting.
        const existingPlayers = {};
        Object.keys(gameState).forEach(key => {
            if (key.startsWith("player")) {
                existingPlayers[gameState[key].id] = key;
            }
        });
        if (Object.keys(existingPlayers).includes(data.playerID)) {
            gameState[existingPlayers[data.playerID]] = {
                id: data.playerID,
                animation: data.animation,
                flipX: data.flipX,
                x: playerStartingPositions[existingPlayers[data.playerID]].x,
                y: playerStartingPositions[existingPlayers[data.playerID]].y,
            }
            games[data.gameID] = gameState;
            console.log(`Player ${data.playerID} reconnecting to game ${data.gameID} as ${existingPlayers[data.playerID]}`);
            io.room(channel.roomId).emit(
                "chat message",
                JSON.stringify(gameState),
            )
            return null;
        }

        // Player doesn't yet exist.
        [1, 2, 3, 4].every(player => {
            if (!Object.keys(gameState).includes(`player${player}`)) {
                gameState[`player${player}`] = {
                    id: data.playerID,
                    animation: data.animation,
                    flipX: data.flipX,
                    x: playerStartingPositions[`player${player}`].x,
                    y: playerStartingPositions[`player${player}`].y,
                }
                games[data.gameID] = gameState;
                console.log(`Player ${data.playerID} connecting to game ${data.gameID} as ${existingPlayers[data.playerID]}`);
                io.room(channel.roomId).emit(
                    "chat message",
                    JSON.stringify(gameState),
                )
                return false;
            }
            return true;
        })
    }
    // Game is full.
    // TODO - implement logic.
}

const updatePlayerPosition = (data, channel) => {
    const gameState = games[data.gameID];
    gameState[data.label] = {
        ...gameState[data.label],
        animation: data.animation,
        flipX: data.flipX,
        x: data.x,
        y: data.y,
    }
    games[data.gameID] = gameState;
    io.room(channel.roomId).emit(
        "chat message",
        JSON.stringify(gameState),
    )
}
