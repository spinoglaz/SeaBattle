ui = {
    mainMenuScreen: document.getElementById('mainMenuScreen'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    placeShipsButton: document.getElementById('placeShips'),
    placingShipsScreen: document.getElementById('placingShipsScreen'),
    placingField: document.querySelector('#placingShipsScreen .field'),
    placingGrid: document.querySelector('#placingShipsScreen .field-grid'),
    placingFleet: document.querySelector('#placingShipsScreen .fleet'),
    placingShipsExitButton: document.getElementById('placingShipsExit'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    battleScreen: document.getElementById('battleScreen'),
    placingState: {
        grabShip: 0,
        grabVertical: false,
        grabOffset: 0,
        grabElement: null,
        fleet: [],
    },
    start: function(callbacks) {
        this.startBattleButton.onclick = callbacks.startBattle;
        this.placingShipsExitButton.onclick = callbacks.exitPlacingShips;
        const self = this;
        this.placeShipsButton.onclick = function() {callbacks.placeShips(self.placingState.fleet);};
        this.placingGrid.oncontextmenu = function() {
            ui.placingState.grabVertical = !ui.placingState.grabVertical;
            return false;
        };
        this.placingGrid.onmousemove = function(e) {
            const bounds = this.getBoundingClientRect();
            let pixelsX = e.pageX - bounds.left;
            let pixelsY = e.pageY - bounds.top;
            let x = Math.round(pixelsX / bounds.width * ui.battle.fieldSize - 0.5);
            let y = Math.round(pixelsY / bounds.height * ui.battle.fieldSize - 0.5);
            // TODO preview ship placement
        };
        this.placingGrid.onmousedown = function(e) {
            const bounds = this.getBoundingClientRect();
            let pixelsX = e.pageX - bounds.left;
            let pixelsY = e.pageY - bounds.top;
            let x = Math.round(pixelsX / bounds.width * ui.battle.fieldSize - 0.5);
            let y = Math.round(pixelsY / bounds.height * ui.battle.fieldSize - 0.5);
            ui._placeCurrentShip(x, y);
        }
    },
    showLoader: function(text) {
        ui.loader.classList.add('active');
        ui.loaderText.textContent = text;
    },
    hideLoader: function() {
        ui.loader.classList.remove('active');
    },
    showBattle: function() {
        ui.placingShipsScreen.classList.remove('active');
        ui.battleScreen.classList.add('active');
    },
    joinBattle: function(battle) {
        // TODO remove placed ships from previous session
        this.battle = battle;
        this.hideLoader();
        this.placeShipsButton.classList.remove('revealed');
        this.placingShipsScreen.classList.add('active');
        this._setFieldSize(battle.fieldSize);
        this._setFleet(battle.shipSizes);
        this._grabShip(0);
    },
    _setFieldSize: function(fieldSize) {
        this.placingGrid.textContent = '';
        let cellCount = fieldSize * fieldSize;
        for(let i = 0; i < cellCount; ++i) {
            let cell = document.createElement('div');
            cell.classList.add('field-cell');
            this.placingGrid.appendChild(cell);
        }
    },
    _setFleet: function(shipSizes) {
        this._clearFleet();
        let previousSize = 0;
        for (let i = 0; i < shipSizes.length; ++i) {
            let shipSize = shipSizes[i];
            if (previousSize !== 0 && previousSize !== shipSize) {
                this.placingFleet.appendChild(document.createElement('br'));
            }
            let shipContainer = this._createShipContainer(shipSize);
            this.placingFleet.appendChild(shipContainer);
            shipContainer.onmousedown = function() {
                ui._grabShip(i);
            };
            previousSize = shipSize;
            this.placingState.fleet.push({
                x: null,
                y: null,
                vertical: null,
                size: shipSize,
                element: shipContainer,
                fieldElement: null,
                placed: false,
            });
        }
    },
    _grabShip: function(index) {
        this._ungrabShip(this.placingState.grabShip);
        this.placingState.grabShip = index;
        if (index != null) {
            let fleetItem = this.placingState.fleet[index];
            if (fleetItem.placed) {
                this._unplaceShip(index);
            }
            fleetItem.element.classList.add('selected');
        }
    },
    _ungrabShip: function(index) {
        if (index == null)
            return;
        this.placingState.fleet[index].element.classList.remove('selected');
    },
    _placeCurrentShip: function(x, y) {
        if (this.placingState.grabShip === null) {
            return;
        }
        this._placeShip(this.placingState.grabShip, x, y, this.placingState.grabVertical);
        const nextShipToPlace = this._decideNextShipToPlace();
        this._grabShip(nextShipToPlace);
        if (nextShipToPlace === null) {
            this.placeShipsButton.classList.add('revealed');
        }
        else {
            this.placeShipsButton.classList.remove('revealed');
        }
    },
    _decideNextShipToPlace: function() {
        const shipSizes = ui.battle.shipSizes;
        for (let i = 0; i < shipSizes.length; ++i) {
            const nextShipToPlace = (this.placingState.grabShip + i) % shipSizes.length;
            if (!this.placingState.fleet[nextShipToPlace].placed) {
                return nextShipToPlace;
            }
        }
        return null;
    },
    _placeShip: function(shipIndex, x, y, vertical) {
        const fleetItem = this.placingState.fleet[shipIndex];
        fleetItem.x = x;
        fleetItem.y = y;
        fleetItem.vertical = vertical;
        fleetItem.placed = true;
        fleetItem.element.classList.add('placed');
        fleetItem.fieldElement = this._createShip(fleetItem.size);
        if (vertical === true) {
            fleetItem.fieldElement.classList.add('vertical');
        }
        fleetItem.fieldElement.style.left = 'calc(35px * ' + x + ')';
        fleetItem.fieldElement.style.top = 'calc(35px * ' + y + ')';
        this.placingField.appendChild(fleetItem.fieldElement);
    },
    _unplaceShip: function(index) {
        const fleetItem = this.placingState.fleet[index];
        fleetItem.x = null;
        fleetItem.y = null;
        fleetItem.vertical = null;
        fleetItem.placed = false;
        fleetItem.element.classList.remove('placed');
        this.placingField.removeChild(fleetItem.fieldElement);
        this.placeShipsButton.classList.remove('revealed');
    },
    _clearFleet: function() {
        this.placingState.fleet = [];
        this.placingFleet.textContent = '';
    },
    _createShipContainer: function(shipSize) {
        const shipContainer = document.createElement('div');
        shipContainer.classList.add('ship-container');
        const ship = this._createShip(shipSize);
        shipContainer.appendChild(ship);
        return shipContainer;
    },
    _createShip: function(shipSize) {
        let ship = document.createElement('div');
        ship.classList.add('ship');
        for (let i = 0; i < shipSize; ++i) {
            const shipCell = document.createElement('div');
            shipCell.classList.add('ship-cell');
            ship.appendChild(shipCell);
        }
        return ship;
    },
};

// TODO extract placer from ui

server = {
    connect: function(callbacks) {
        this.callbacks = callbacks;
        const protocol = location.protocol === "https:" ? "wss" : "ws";
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
        const serverMessage = JSON.parse(event.data);
        if (serverMessage.joinedToBattle) {
            this.callbacks.joinedToBattle(serverMessage.joinedToBattle);
        }
        if (serverMessage.battleUpdate) {
            this.callbacks.battleUpdate(serverMessage.battleUpdate);
        }
        if (serverMessage.shot) {
            this.callbacks.shot(serverMessage.shot);
        }
    },
};

game = {
    start: function() {
        ui.start({
            startBattle: this.startBattle,
            exitPlacingShips: this.exitPlacingShips,
            placeShips: this.placeShips,
        });
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
        ui.mainMenuScreen.classList.add('active');
    },
    onJoinedToBattle: function(joinedBattleEvent) {
        this.player = joinedBattleEvent.player;
        this.battle = {
            playerCount: joinedBattleEvent.playerCount,
            fieldSize: joinedBattleEvent.fieldSize,
            shipSizes: joinedBattleEvent.shipSizes.sort(),
        };
        ui.joinBattle(this.battle);
    },
    onBattleUpdate: function() {

    },
    onShot: function() {

    },
    // UI events
    startBattle: function() {
        ui.mainMenuScreen.classList.remove('active');
        ui.showLoader("Waiting for a battle...");
        server.startBattle();
    },
    exitPlacingShips: function() {
        ui.placingShipsScreen.classList.remove('active');
        ui.mainMenuScreen.classList.add('active');
        // TODO leave the battle or reconnect websocket
    },
    placeShips: function(ships) {
        const commandShips = [];
        for (let i = 0; i < ships.length; ++i) {
            const ship = ships[i];
            commandShips.push({
               x: ship.x,
               y: ship.y,
               vertical: ship.vertical,
               size: ship.size,
            });
        }
        server.placeShips(commandShips);
        ui.showBattle();
    },
};

game.start();
