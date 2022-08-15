import geckos from "@geckos.io/server";

const io = geckos()

io.listen() // default port is 9208

const maxNumberOfPlayers = 2;
const games = {}
const playersInitialData = {
    player1: {key: "blue", x: 200, y: 200},
    player2: {key: "brown", x: 300, y: 200},
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
                key: playersInitialData.player1.key,
                x: playersInitialData.player1.x,
                y: playersInitialData.player1.y,
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
                key: playersInitialData[existingPlayers[data.playerID]].key,
                x: playersInitialData[existingPlayers[data.playerID]].x,
                y: playersInitialData[existingPlayers[data.playerID]].y,
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
        [1, 2].every(player => {
            if (!Object.keys(gameState).includes(`player${player}`)) {
                gameState[`player${player}`] = {
                    id: data.playerID,
                    animation: data.animation,
                    flipX: data.flipX,
                    key: playersInitialData[`player${player}`].key,
                    x: playersInitialData[`player${player}`].x,
                    y: playersInitialData[`player${player}`].y,
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
        key: data.key,
        x: data.x,
        y: data.y,
    }
    games[data.gameID] = gameState;
    io.room(channel.roomId).emit(
        "chat message",
        JSON.stringify(gameState),
    )
}
