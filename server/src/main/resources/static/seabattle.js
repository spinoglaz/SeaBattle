function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function Ship(size, styleClass) {
    this.size = 0;
    this.vertical = false;
    this.element = document.createElement('div');
    this.element.classList.add('ship');
    this.cells = [];
    this.invalid = false;
    if (styleClass) {
        this.element.classList.add(styleClass);
    }

    this._addCell = function() {
        const cell = document.createElement('div');
        cell.classList.add('ship-cell');
        this.element.appendChild(cell);
        this.cells.push(cell);
    };
    this.disableMouseEvents = function() {
        this.element.style.pointerEvents = 'none';
    };
    this.disableContextMenu = function() {
        this.element.oncontextmenu = function() {return false};
    };
    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
        // TODO remove hard-code
        this.element.style.left = (35 * x) + 'px';
        this.element.style.top = (35 * y) + 'px';
    };
    this.setVertical = function(vertical) {
        this.vertical = vertical;
        if (vertical)
            this.element.classList.add('vertical');
        else
            this.element.classList.remove('vertical');
    };
    this.setSize = function(size) {
        for(let i = size; i < this.size; ++i) {
            this.element.removeChild(this.cells.pop());
        }
        for (let i = this.size; i < size; ++i) {
            this._addCell();
        }
        this.size = size;
    };
    this.getSizeX = function() {
        return this.vertical ? 1 : this.size;
    };
    this.getSizeY = function() {
        return this.vertical ? this.size : 1;
    };
    this.setInvalid = function(invalid) {
        this.invalid = invalid;
        if (invalid)
            this.element.classList.add('invalid');
        else
            this.element.classList.remove('invalid');
    };
    this.setPlaced = function(placed) {
        if (placed)
            this.element.classList.add('placed');
        else
            this.element.classList.remove('placed');
    };
    this.setSelected = function(selected) {
        if (selected)
            this.element.classList.add('selected');
        else
            this.element.classList.remove('selected');
    };
    this.setVisible = function(visible) {
        this.element.style.visibility = visible ? 'visible' : 'hidden';
    };
    this.hide = function() {
        this.setVisible(false);
    };
    this.show = function() {
        this.setVisible(true);
    };

    this.setSize(size);
    this.disableContextMenu();
}

function Field(size, styleClass) {
    this.size = 0;
    this.element = document.createElement('div');
    this.element.classList.add('field');
    if (styleClass)
        this.element.classList.add(styleClass);
    this.gridElement = document.createElement('div');
    this.gridElement.classList.add('field-grid');
    this.element.appendChild(this.gridElement);
    this.ships = [];

    this.reset = function(size) {
        this.size = size;
        this.gridElement.textContent = '';
        const cellCount = size * size;
        for(let i = 0; i < cellCount; ++i) {
            const cell = document.createElement('div');
            cell.classList.add('field-cell');
            this.gridElement.appendChild(cell);
        }
        for (let i = 0; i < this.ships.length; ++i) {
            this.element.removeChild(this.ships[i].element);
        }
        this.ships = [];
    };
    this.addShip = function(ship) {
        this.element.appendChild(ship.element);
        this.ships.push(ship);
    };
    this.removeShip = function(ship) {
        const index = this.ships.indexOf(ship);
        this.ships.splice(index, 1);
        this.element.removeChild(ship.element);
    };
    this.canFit = function(ship) {
        const x = ship.x;
        const y = ship.y;
        if (x < 0) return false;
        if (y < 0) return false;
        const right = x + ship.getSizeX() - 1;
        const bottom = y + ship.getSizeY() - 1;
        if (right >= this.size) return false;
        if (bottom >= this.size) return false;
        for (let i = 0; i < this.ships.length; ++i) {
            const placed = this.ships[i];
            const placedX = placed.x - 1;
            const placedY = placed.y - 1;
            const placedRight = placed.x + placed.getSizeX();
            const placedBottom = placed.y + placed.getSizeY();
            if (x <= placedRight && y <= placedBottom && right >= placedX && bottom >= placedY)
                return false;
        }
        return true;
    };
    this.reset(size);
}

function Fleet(shipSizes, styleClass) {
    this.size = 0;
    this.element = document.createElement('div');
    this.element.classList.add('fleet');
    if (styleClass)
        this.element.classList.add(styleClass);
    this.ships = [];
    this.selected = null;

    this.reset = function(shipSizes) {
        this.ships = [];
        this.element.textContent = '';

        this.size = shipSizes.length;
        let previousSize = 0;
        for (let i = 0; i < shipSizes.length; ++i) {
            const shipSize = shipSizes[i];
            if (previousSize !== 0 && previousSize !== shipSize) {
                this.element.appendChild(document.createElement('br'));
            }
            const ship = new Ship(shipSize);
            this.element.appendChild(ship.element);
            this.ships.push(ship);
            previousSize = shipSize;
        }
    };
    this.select = function(index) {
        if (this.selected != null) {
            this.ships[this.selected].setSelected(false);
        }
        this.selected = index;
        if (this.selected == null) return null;

        const ship = this.ships[index];
        ship.setSelected(true);
        return ship;
    };
    this.reset(shipSizes);
    this.select(null);
}

ui = {
    mainMenuScreen: document.getElementById('mainMenuScreen'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    placingShipsScreen: document.getElementById('placingShipsScreen'),
    placeShipsButton: document.getElementById('placeShips'),
    resetFieldButton: document.getElementById('resetField'),
    placingGrid: document.querySelector('#placingShipsScreen .field-grid'),
    placingShipsExitButton: document.getElementById('placingShipsExit'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    battleScreen: document.getElementById('battleScreen'),
    placingState: {
        grabIndex: 0,
        grabVertical: false,
        grabOffset: 0,  // TODO Implement it
        fleet: [],
        allPlaced: false,
        preview: null,
    },
    start: function(callbacks) {
        this.placingField = new Field(0, 'field-placing');
        this.placingShipsScreen.appendChild(this.placingField.element);

        this.placingFleet = new Fleet([], 'fleet-placing');
        this.placingShipsScreen.appendChild(this.placingFleet.element);

        this.placingState.preview = new Ship(1, 'preview');
        this.placingState.preview.disableMouseEvents();
        this.placingState.preview.hide();
        this.placingField.element.appendChild(this.placingState.preview.element);

        this.startBattleButton.onclick = callbacks.startBattle;
        this.placingShipsExitButton.onclick = callbacks.exitPlacingShips;
        const self = this;
        this.resetFieldButton.onclick = function() {self._resetField()};
        this.placeShipsButton.onclick = function() {callbacks.placeShips(self.placingField.ships);};
        this.placingField.gridElement.oncontextmenu = function() {return false};
        this.placingField.gridElement.onmousemove = function(e) {
            const bounds = this.getBoundingClientRect();
            const pixelsX = e.pageX - bounds.left;
            const pixelsY = e.pageY - bounds.top;
            let x = Math.round(pixelsX / bounds.width * ui.battle.fieldSize - 0.5);
            let y = Math.round(pixelsY / bounds.height * ui.battle.fieldSize - 0.5);
            x = clamp(x, 0, ui.battle.fieldSize - 1);
            y = clamp(y, 0, ui.battle.fieldSize - 1);
            if (!self.placingState.allPlaced) {
                self.placingState.preview.setPosition(x, y);
                self.placingState.preview.show();
            }
            self._validatePreview();
        };
        this.placingField.gridElement.onmouseleave = function() {
            self.placingState.preview.hide();
        };
        this.placingField.gridElement.onmousedown = function(e) {
            if (e.button === 0) {
                self._placeCurrentShip();
            }
            if (e.button === 2) {
                self._toggleVertical();
            }
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
        this.battle = battle;
        this.hideLoader();
        this.placeShipsButton.classList.remove('revealed');
        this.placingShipsScreen.classList.add('active');
        this.placingField.reset(battle.fieldSize);
        this.placingFleet.reset(battle.shipSizes);
        this._setFleet(this.placingFleet);
        this._grabShip(0);
    },
    _resetField: function() {
        for (let i = 0; i < this.placingState.fleet.length; ++i) {
            this._unplaceShip(i);
        }
        this._grabShip(0);
        this.placingState.preview.hide();
    },
    _toggleVertical: function() {
        this.placingState.grabVertical = !this.placingState.grabVertical;
        this.placingState.preview.setVertical(this.placingState.grabVertical);
        this._validatePreview();
    },
    _setFleet: function(fleet) {
        this.placingState.fleet = [];
        for (let i = 0; i < fleet.size; ++i) {
            const ship = fleet.ships[i];
            ship.element.onmousedown = function(e) {
                if (e.button === 0) {
                    ui._grabShip(i);
                }
            };
            this.placingState.fleet.push({
                placedShip: null,
            });
        }
    },
    _grabShip: function(index) {
        const fleetShip = this.placingFleet.select(index);
        this.placingState.grabIndex = index;
        if (index == null) {
            this.placingState.preview.hide();
        }
        else {
            const fleetItem = this.placingState.fleet[index];
            if (fleetItem.placedShip) {
                this.placingState.grabVertical = fleetItem.placedShip.vertical;
                this.placingState.preview.setPosition(fleetItem.placedShip.x, fleetItem.placedShip.y);
                this._unplaceShip(index);
            }
            this.placingState.preview.setVertical(this.placingState.grabVertical);
            this.placingState.preview.setSize(fleetShip.size);
            this._validatePreview();
        }
    },
    _placeCurrentShip: function() {
        if (this.placingState.grabIndex === null) return;
        if (this.placingState.preview.invalid) return;
        const x = this.placingState.preview.x;
        const y = this.placingState.preview.y;
        this._placeShip(this.placingState.grabIndex, x, y, this.placingState.grabVertical);
        const nextShipToPlace = this._decideNextShipToPlace();
        this._grabShip(nextShipToPlace);
        this.placingState.allPlaced = nextShipToPlace === null;
        if (this.placingState.allPlaced) {
            this.placeShipsButton.classList.add('revealed');
        }
        else {
            this.placeShipsButton.classList.remove('revealed');
        }
    },
    _decideNextShipToPlace: function() {
        const shipSizes = ui.battle.shipSizes;
        for (let i = 0; i < shipSizes.length; ++i) {
            const nextShipToPlace = (this.placingState.grabIndex + i) % shipSizes.length;
            if (!this.placingState.fleet[nextShipToPlace].placedShip) {
                return nextShipToPlace;
            }
        }
        return null;
    },
    _placeShip: function(shipIndex, x, y, vertical) {
        const fleetItem = this.placingState.fleet[shipIndex];
        const fleetShip = this.placingFleet.ships[shipIndex];
        fleetShip.setPlaced(true);
        fleetItem.placedShip = new Ship(fleetShip.size);
        fleetItem.placedShip.setPosition(x, y);
        fleetItem.placedShip.setVertical(vertical);
        const self = this;
        fleetItem.placedShip.element.onmousedown = function(e) {
            if (e.button === 0) {
                self._grabShip(shipIndex);
            }
        };
        this.placingField.addShip(fleetItem.placedShip);
    },
    _unplaceShip: function(index) {
        const fleetItem = this.placingState.fleet[index];
        if (!fleetItem.placedShip) return;
        this.placingFleet.ships[index].setPlaced(false);
        this.placingField.removeShip(fleetItem.placedShip);
        fleetItem.placedShip = null;
        this.placingState.allPlaced = false;
        this.placeShipsButton.classList.remove('revealed');
        this.placingState.preview.show();
        this._validatePreview();
    },
    _validatePreview: function() {
        const isValid = this.placingField.canFit(this.placingState.preview);
        this.placingState.preview.setInvalid(!isValid);
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
