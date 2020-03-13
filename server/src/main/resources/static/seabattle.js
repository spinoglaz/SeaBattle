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
    placingFleetShips: [],
    placingShipIndex: 0,
    start: function() {
        this.placingGrid.oncontextmenu = function() {
            return false;
        };
        this.placingGrid.onmousemove = function(e) {
            const bounds = this.getBoundingClientRect();
            let pixelsX = e.pageX - bounds.left;
            let pixelsY = e.pageY - bounds.top;
            let x = Math.round(pixelsX / bounds.width * game.battle.fieldSize - 0.5);
            let y = Math.round(pixelsY / bounds.height * game.battle.fieldSize - 0.5);
            console.log(x + ' ' + y);
        };
    },
    showLoader: function(text) {
        ui.loader.classList.add('active');
        ui.loaderText.textContent = text;
    },
    hideLoader: function() {
        ui.loader.classList.remove('active');
    },
    startPlacingShips: function(battle) {
        this.hideLoader();
        this.placingShips.classList.add('active');
        this.setFieldSize(battle.fieldSize);
        this.setFleet(battle.shipSizes);

        // TODO remove debug placements
        this.placeShip(0, 7, 5);
        this.placeShip(9, 2, 1);
    },
    setFieldSize: function(fieldSize) {
        this.placingGrid.textContent = '';
        let cellCount = fieldSize * fieldSize;
        for(let i = 0; i < cellCount; ++i) {
            let cell = document.createElement('div');
            cell.classList.add('field-cell');
            this.placingGrid.appendChild(cell);
        }
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
                console.log('Click on ' + i + ' ship');
                shipContainer.classList.add('selected');
            };
            previousSize = shipSize;
            this.placingFleetShips.push(shipContainer);
        }
    },
    placeShip: function(shipIndex, x, y) {
        this.placingFleetShips[shipIndex].classList.add('placed');
    },
    clearFleet: function() {
        this.placingFleetShips = [];
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

server = {
    connect: function(callbacks) {
        this.callbacks = callbacks;
        protocol = location.protocol === "https:" ? "wss" : "ws";
        this.ws = new WebSocket(protocol + '://' + location.host + '/ws');
        this.ws.onopen = this.callbacks.connected;
        this.ws.onmessage = function(event) {server.onMessage(event);}
    },
    startBattle: function() {
        this.send({startBattle: {}});
    },
    placeShips: function(ships) {
        this.send({placeShips: {ships: ships}});
    },
    shoot: function(target, x, y) {
        this.send({shoot: {target: target, x: x, y: y}})
    },
    send: function(obj) {
        this.ws.send(JSON.stringify(obj));
    },
    onMessage: function(event) {
        console.log(this);
        var serverMessage = JSON.parse(event.data);
        if (serverMessage.joinedToBattle) {
            this.callbacks.joinedToBattle(serverMessage.joinedToBattle);
        }
        if (serverMessage.battleUpdate) {
            this.callbacks.battleUpdate(serverMessage.battleUpdate)
        }
        if (serverMessage.shot) {
            this.callbacks.shot(serverMessage.shot)
        }
    },
};

game = {
    start: function() {
        ui.start();
        ui.startBattleButton.onclick = this.startBattle;
        ui.placingShipsExitButton.onclick = this.exitPlacingShips;
        ui.onPlaceShips = this.onPlaceShips;
        ui.showLoader("Connecting to the server...");
        server.connect({
            connected: this.onConnectedToServer,
            joinedToBattle: this.onJoinedToBattle,
            battleUpdate: this.onBattleUpdate,
            shot: this.onShot,
        });
    },
    // Server events
    onConnectedToServer: function() {
        ui.hideLoader();
        ui.mainMenu.classList.add('active');
    },
    onJoinedToBattle: function(joinedBattleEvent) {
        this.player = joinedBattleEvent.player;
        this.battle = {
            playerCount: joinedBattleEvent.playerCount,
            fieldSize: joinedBattleEvent.fieldSize,
            shipSizes: joinedBattleEvent.shipSizes.sort(),
        };
        ui.startPlacingShips(this.battle);
    },
    onBattleUpdate: function() {

    },
    onShot: function() {

    },
    // UI events
    startBattle: function() {
        ui.mainMenu.classList.remove('active');
        ui.showLoader("Waiting for a battle...");
        server.startBattle();
    },
    exitPlacingShips: function() {
        ui.placingShips.classList.remove('active');
        ui.mainMenu.classList.add('active');
        // TODO leave the battle or reconnect websocket
    },
    onPlaceShips: function(ships) {
        commandShips = [];
        server.placeShips(commandShips)
    },
    placingState: {
        grabShip: 0,
        grabVertical: false,
        grabOffset: 0,
        grabElement: null,
        fleet: [],
    },
};

game.start();
