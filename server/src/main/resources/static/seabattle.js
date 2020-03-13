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
    placingState: {
        grabShip: 0,
        grabVertical: false,
        grabOffset: 0,
        grabElement: null,
        fleet: [],
    },
    start: function() {
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
        this.placingGrid.onclick = function(e) {
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
    startPlacingShips: function(battle) {
        // TODO remove placed ships from previous session
        this.battle = battle;
        this.hideLoader();
        this.placingShips.classList.add('active');
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
            shipContainer.onclick = function() {
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
            // TODO all ships are placed, reveal the continue button
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
};

game.start();
