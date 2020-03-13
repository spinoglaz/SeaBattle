ui = {
    mainMenu: document.getElementById('mainMenu'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    placingShips: document.getElementById('placingShips'),
    placingField: document.querySelector('#placingShips .field'),
    placingGrid: document.querySelector('#placingShips .field-grid'),
    placingFleet: document.querySelector('#placingShips .fleet'),
    placingShipsExitButton: document.getElementById('placingShipsExit'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    showLoader: function(text) {
        ui.loader.classList.add('active');
        ui.loaderText.textContent = text;
    },
    hideLoader: function() {
        ui.loader.classList.remove('active');
    },
    setFleet: function(shipSizes) {
        this.clearFleet();
        let previousSize = 0;
        for (let i = 0; i < shipSizes.length; ++i) {
            let shipSize = shipSizes[i];
            if (previousSize !== 0 && previousSize !== shipSize) {
                this.placingFleet.appendChild(document.createElement('br'));
            }
            let shipContainer = this.createShipContainer(shipSize);
            this.placingFleet.appendChild(shipContainer);
            shipContainer.onclick = function() {
                shipContainer.classList.add('selected');
            };
            previousSize = shipSize;
        }
    },
    clearFleet: function() {
        this.placingFleet.textContent = '';
    },
    createShipContainer: function(shipSize) {
        var shipContainer = document.createElement('div');
        shipContainer.classList.add('ship-container');
        var ship = document.createElement('div');
        ship.classList.add('ship');
        shipContainer.appendChild(ship);
        for (var i = 0; i < shipSize; ++i) {
            var shipCell = document.createElement('div');
            shipCell.classList.add('ship-cell');
            ship.appendChild(shipCell);
        }
        return shipContainer;
    },
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
            shipSizes: joinedBattleEvent.shipSizes.sort(),
        };
        ui.setFleet(this.battle.shipSizes);
    }
};

ui.startBattleButton.onclick = game.startBattle;
ui.placingShipsExitButton.onclick = game.exitPlacingShips;
ui.placingGrid.oncontextmenu = function() {
    return false;
};
ui.placingGrid.onmousemove = function(e) {
    const bounds = this.getBoundingClientRect();
    let pixelsX = e.pageX - bounds.left;
    let pixelsY = e.pageY - bounds.top;
    let x = Math.round(pixelsX / bounds.width * game.battle.fieldSize - 0.5);
    let y = Math.round(pixelsY / bounds.height * game.battle.fieldSize - 0.5);
    console.log(x + ' ' + y);
};

game.start();
