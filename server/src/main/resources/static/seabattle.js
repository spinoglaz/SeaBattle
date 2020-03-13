ui = {
    mainMenu: document.getElementById('mainMenu'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    placingShips: document.getElementById('placingShips'),
    placingShipsField: document.querySelector('#placingShips .field'),
    placingShipsExitButton: document.getElementById('placingShipsExit'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    showLoader: function(text) {
        ui.loader.classList.add('active');
        ui.loaderText.textContent = text;
    },
    hideLoader: function() {
        ui.loader.classList.remove('active');
    }
};

game = {
    start: function() {
        ui.showLoader("Connecting to the server...");
        protocol = location.protocol === "https:" ? "wss" : "ws";
        ws = new WebSocket(protocol + '://' + location.host + '/ws');
        ws.onopen = game.onConnectedToServer;
        ws.onmessage = function(event){
            var serverMessage = JSON.parse(event.data);
            game.onServerMessage(serverMessage);
        };
    },
    startBattle: function() {
        ui.mainMenu.classList.remove('active');
        ui.showLoader("Waiting for a battle...");
        ws.send(JSON.stringify({
            startBattle: {},
        }));
    },
    exitPlacingShips: function() {
        ui.placingShips.classList.remove('active');
        ui.mainMenu.classList.add('active');
        // TODO leave the battle or reconnect websocket
    },
    onConnectedToServer: function() {
        ui.hideLoader();
        ui.mainMenu.classList.add('active');
    },
    onServerMessage: function(serverMessage) {
        if (serverMessage.joinedToBattle) {
            game.onJoinedToBattle(serverMessage.joinedToBattle);
        }
    },
    onJoinedToBattle: function(joinedBattleEvent) {
        ui.hideLoader();
        ui.placingShips.classList.add('active');
        this.player = joinedBattleEvent.player;
        this.battle = {
            playerCount: joinedBattleEvent.playerCount,
            fieldSize: joinedBattleEvent.fieldSize,
            shipSizes: joinedBattleEvent.shipSizes,
        }
    }
};

ui.startBattleButton.onclick = game.startBattle;
ui.placingShipsExitButton.onclick = game.exitPlacingShips;
ui.placingShipsField.oncontextmenu = function() {
    return false;
};

game.start();
