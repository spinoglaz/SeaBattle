function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const copyToClipboard = str => {
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0)     // Store selection if found
            : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
    }
};

function calcGridCoordinates(element, e, sizeX, sizeY) {
    const bounds = element.getBoundingClientRect();
    const pixelsX = e.pageX - bounds.left;
    const pixelsY = e.pageY - bounds.top;
    let x = Math.round(pixelsX / bounds.width * sizeX - 0.5);
    let y = Math.round(pixelsY / bounds.height * sizeY - 0.5);
    x = clamp(x, 0, sizeX - 1);
    y = clamp(y, 0, sizeY - 1);
    return {x: x, y: y}
}

function createBattleUrl(battleId) {
    const battleUrl = new URL(window.location);
    battleUrl.searchParams.set('battleId', battleId);
    return battleUrl.toString();
}

function Ship(size, styleClass) {
    this.size = 0;
    this.vertical = false;
    this.element = document.createElement('div');
    this.element.classList.add('ship');
    this.cells = [];
    this.invalid = false;
    this.sunk = false;
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
    this.setSize = function(size) {
        for(let i = size; i < this.size; ++i) {
            this.element.removeChild(this.cells.pop());
        }
        for (let i = this.size; i < size; ++i) {
            this._addCell();
        }
        this.size = size;
        this._updateStyle();
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
    this.setSunk = function(sunk) {
        if (sunk)
            this.element.classList.add('sunk');
        else
            this.element.classList.remove('sunk');
        this.sunk = sunk;
    };
    this.hide = function() {
        this.setVisible(false);
    };
    this.show = function() {
        this.setVisible(true);
    };
    // Following methods are for field ships only
    this.setCellSize = function(cellSize) {
        this.cellSize = cellSize;
        this._updateStyle();
    };
    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
        this._updateStyle();
    };
    this.setVertical = function(vertical) {
        this.vertical = vertical;
        if (vertical)
            this.element.classList.add('vertical');
        else
            this.element.classList.remove('vertical');
        this._updateStyle();
    };
    this._updateStyle = function() {
        this.element.style.left = (this.cellSize * this.x) + 'px';
        this.element.style.top = (this.cellSize * this.y) + 'px';
        this.element.style.width = (this.getSizeX() * this.cellSize - 1) + 'px';
        this.element.style.height = (this.getSizeY() * this.cellSize - 1) + 'px';
    };
    this.clone = function() {
        const clone = new Ship(this.size);
        clone.setPosition(this.x, this.y);
        clone.setVertical(this.vertical);
        return clone;
    };

    this.setSize(size);
    this.disableContextMenu();
}

const CellState = Object.freeze({
    uncharted: 'uncharted',
    empty: 'empty',
    occupied: 'occupied',
})

function Field(size, styleClass) {
    this.size = 0;
    this.element = document.createElement('div');
    this.element.classList.add('field');
    if (styleClass)
        this.element.classList.add(styleClass);
    this.gridElement = document.createElement('div');
    this.gridElement.classList.add('field-grid');
    this.gridElement.oncontextmenu = function() {return false};
    this.element.appendChild(this.gridElement);
    this.ships = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.onMouseMove = null;
    this.onMouseDown = null;
    this.cells = [];
    this.cellStates = [];

    this.handleEvent = function(e) {
        if (e.type === 'mousemove') return this._onmousemove(e);
        if (e.type === 'mousedown') return this._onmousedown(e);
    };
    this.gridElement.addEventListener('mousemove', this);
    this.gridElement.addEventListener('mousedown', this);

    this.reset = function(size) {
        this.size = size;
        this.gridElement.textContent = '';
        const cellCount = size * size;
        this.cells = [];
        this.cellStates = [];
        for(let i = 0; i < cellCount; ++i) {
            const cell = document.createElement('div');
            cell.classList.add('field-cell');
            this.gridElement.appendChild(cell);
            this.cells.push(cell);
            this.cellStates.push(CellState.uncharted);
        }
        for (let i = 0; i < this.ships.length; ++i) {
            this.element.removeChild(this.ships[i].element);
        }
        this.ships = [];
    };
    this.addShip = function(ship) {
        const cellSize = this.gridElement.offsetWidth / this.size;
        ship.setCellSize(cellSize);
        this.element.appendChild(ship.element);
        this.ships.push(ship);
    };
    this.removeShip = function(ship) {
        const index = this.ships.indexOf(ship);
        this.ships.splice(index, 1);
        this.element.removeChild(ship.element);
    };
    this.canFit = function(x, y, size, vertical) {
        if (x < 0) return false;
        if (y < 0) return false;
        const sizeX = vertical ? 1 : size;
        const sizeY = vertical ? size : 1;
        const right = x + sizeX - 1;
        const bottom = y + sizeY - 1;
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
    this.canFitShip = function(ship) {
        return this.canFit(ship.x, ship.y, ship.size, ship.vertical);
    };
    this.getCell = function(x, y) {
        if (x < 0 || x >= this.size) return null;
        if (y < 0 || y >= this.size) return null;
        return this.cells[x + y * this.size];
    };
    this.getCellState = function(x, y) {
        if (x < 0 || x >= this.size) return null;
        if (y < 0 || y >= this.size) return null;
        return this.cellStates[x + y * this.size];
    };
    this.setCellState = function(x, y, state) {
        if (x < 0 || x >= this.size) return;
        if (y < 0 || y >= this.size) return;
        const index = x + y * this.size;
        const cell = this.cells[index];
        this.cellStates[index] = state;
        cell.classList.remove(CellState.empty);
        cell.classList.remove(CellState.occupied);
        cell.classList.add(state);
    };
    this._onmousemove = function(e) {
        const pos = calcGridCoordinates(this.gridElement, e, this.size, this.size);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
        if (this.onMouseMove) {
            this.onMouseMove(this.mouseX, this.mouseY);
        }
    };
    this._onmousedown = function(e) {
        if (this.onMouseDown) {
            this.onMouseDown(e, this.mouseX, this.mouseY);
        }
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

function PlacementController(callbacks) {
    const self = this;
    this.field = new Field(0, 'field-placing');
    this.fleet = new Fleet([], 'fleet-placing');
    this.grabIndex = 0;
    this.grabVertical = false;
    this.grabOffset = 0;
    this.placedShips = [];
    this.allPlaced = false;

    this.preview = new Ship(1, 'preview');
    this.preview.disableMouseEvents();
    this.preview.hide();
    this.field.element.appendChild(this.preview.element);

    this.field.onMouseMove = function(x, y) {self._onGridMouseMove(x, y)};
    this.field.gridElement.onmouseleave = function() {
        self.preview.hide();
    };
    this.field.onMouseDown = function(e, x, y) {
        if (e.button === 0) {
            self._placeCurrentShip();
        }
        if (e.button === 2) {
            self._toggleVertical();
        }
    };

    this.reset = function(battle) {
        this.battle = battle;
        this.field.reset(battle.fieldSize);
        this.fleet.reset(battle.shipSizes);
        this.placedShips = [];
        for (let i = 0; i < this.fleet.size; ++i) {
            const ship = this.fleet.ships[i];
            ship.element.onmousedown = function(e) {
                if (e.button === 0) {
                    self._grabShip(i);
                }
            };
            this.placedShips.push(null);
        }
        this._grabShip(0);
        this.preview.hide();
        this.preview.setCellSize(this.field.gridElement.offsetWidth / this.field.size);
        this._setAllPlaced(false);
        this._randomPositions = [];
        for (let x = 0; x < this.field.size; ++x) {
            for (let y = 0; y < this.field.size; ++y) {
                this._randomPositions.push({
                    x: x,
                    y: y,
                    vertical: true,
                });
                this._randomPositions.push({
                    x: x,
                    y: y,
                    vertical: false,
                });
            }
        }
        shuffle(this._randomPositions);
    };
    this.placeRandomly = function() {
        this.reset(this.battle);
        // Place large ships first
        for (let i = this.fleet.size - 1; i >= 0; --i) {
            this._placeShipRandomly(i);
        }
        this._setAllPlaced(true);
    };
    this._placeShipRandomly = function(shipIndex) {
        const fleetShip = this.fleet.ships[shipIndex];
        for (let i = 0; i < this._randomPositions.length; ++i) {
            const pos = this._randomPositions[i];
            const x = pos.x;
            const y = pos.y;
            const vertical = pos.vertical;
            if (this.field.canFit(x, y, fleetShip.size, vertical)) {
                this._placeShip(shipIndex, x, y, vertical);
                return;
            }
        }
    };
    this._onGridMouseMove = function(x, y) {
        if (!this.allPlaced) {
            const dx = this.preview.vertical ?  0 : this.grabOffset;
            const dy = this.preview.vertical ?  this.grabOffset : 0;
            this.preview.setPosition(x - dx, y - dy);
            this.preview.show();
            this._validatePreview();
        }
    };
    this._toggleVertical = function() {
        if (this.preview.vertical) {
            this.preview.setPosition(this.preview.x - this.grabOffset, this.preview.y + this.grabOffset);
        }
        else {
            this.preview.setPosition(this.preview.x + this.grabOffset, this.preview.y - this.grabOffset);
        }
        this.grabVertical = !this.grabVertical;
        this.preview.setVertical(this.grabVertical);
        this._validatePreview();
    };
    this._grabShip = function(index, offset) {
        const fleetShip = this.fleet.select(index);
        this.grabIndex = index;
        this.grabOffset = offset ? offset : 0;
        if (index == null) {
            this.preview.hide();
        }
        else {
            const placedShip = this.placedShips[index];
            if (placedShip) {
                this.grabVertical = placedShip.vertical;
                this.preview.setPosition(placedShip.x, placedShip.y);
                this._unplaceShip(index);
            }
            this.preview.setVertical(this.grabVertical);
            this.preview.setSize(fleetShip.size);
            this._validatePreview();
        }
    };
    this._placeCurrentShip = function() {
        if (this.allPlaced) return;
        if (this.grabIndex === null) return;
        if (this.preview.invalid) return;
        const x = this.preview.x;
        const y = this.preview.y;
        this._placeShip(this.grabIndex, x, y, this.grabVertical);
        const nextShipToPlace = this._decideNextShipToPlace();
        this._grabShip(nextShipToPlace);
        this._setAllPlaced(nextShipToPlace === null);
    };
    this._decideNextShipToPlace = function() {
        for (let i = 0; i < this.fleet.size; ++i) {
            const nextShipToPlace = (this.grabIndex + i) % this.fleet.size;
            if (!this.placedShips[nextShipToPlace]) {
                return nextShipToPlace;
            }
        }
        return null;
    };
    this._placeShip = function(shipIndex, x, y, vertical) {
        const fleetShip = this.fleet.ships[shipIndex];
        fleetShip.setPlaced(true);
        const placedShip = new Ship(fleetShip.size);
        this.placedShips[shipIndex] = placedShip;
        placedShip.setPosition(x, y);
        placedShip.setVertical(vertical);
        const self = this;
        placedShip.element.onmousedown = function(e) {
            if (e.button === 0) {
                const pos = calcGridCoordinates(placedShip.element, e, placedShip.getSizeX(), placedShip.getSizeY());
                const offset = Math.max(pos.x, pos.y);
                self._grabShip(shipIndex, offset);
            }
        };
        this.field.addShip(placedShip);
    };
    this._unplaceShip = function(index) {
        const placedShip = this.placedShips[index];
        if (!placedShip) return;
        this.fleet.ships[index].setPlaced(false);
        this.field.removeShip(placedShip);
        this.placedShips[index] = null;
        this._setAllPlaced(false);
        this.preview.show();
        this._validatePreview();
    };
    this._validatePreview = function() {
        const isValid = this.field.canFitShip(this.preview);
        this.preview.setInvalid(!isValid);
    };
    this._setAllPlaced = function(allPlaced) {
        this.allPlaced = allPlaced;
        callbacks.allPlaced(allPlaced);
    };
}

function BattleController(callbacks) {
    const self = this;
    this.battleStatusElement = document.createElement('span');
    this.battleStatusElement.classList.add('title-2');
    this.fields = [
        new Field(0),
        new Field(0),
    ];
    this.fleets = [
        new Fleet([]),
        new Fleet([]),
    ];
    this.targetCell = null;
    this.waitServer = false;

    this.reset = function(battle, player) {
        this.battle = battle;
        this.player = player;
        this.enemy = player === 0 ? 1 : 0;
        for (let i = 0; i < this.fields.length; ++i) {
            this.fields[i].reset(battle.fieldSize);
            this.fields[i].element.classList.remove('field-1');
            this.fields[i].element.classList.remove('field-2');
            this.fleets[i].reset(battle.shipSizes);
            this.fleets[i].element.classList.remove('fleet-1');
            this.fleets[i].element.classList.remove('fleet-2');
        }
        this.enemyField = this.fields[this.enemy];
        this.fields[this.player].element.classList.add('field-1');
        this.enemyField.element.classList.add('field-2');
        this.fleets[this.player].element.classList.add('fleet-1');
        this.fleets[this.enemy].element.classList.add('fleet-2');
        this.fields[this.player].onMouseDown = null;
        this.fields[this.player].onMouseMove = null;
        this.enemyField.onMouseDown = function(e, x, y) {self.onEnemyFieldMouseDown(self.enemy, x, y)};
        this.fields[this.enemy].onMouseMove = function(x, y) {self._onEnemyFieldMouseMove(x, y)};
        this.fields[this.enemy].gridElement.onmouseleave = function() {self._onEnemyFieldMouseLeave()};
        this._setBattleStatusText('No opponent');
        this.waitServer = false;
    };
    this.setPlayerShips = function(ships) {
        for (let i = 0; i < ships.length; ++i) {
            const ship = ships[i].clone();
            this.fields[this.player].addShip(ship);
        }
    };
    this.onEnemyFieldMouseDown = function(e, x, y) {
        if (this.status === 'SHOOTING' && !this.waitServer && this.enemyField.getCellState(x, y) === CellState.uncharted) {
            callbacks.shoot(self.enemy, x, y);
            this.waitServer = true;
        }
    };
    this._onEnemyFieldMouseMove = function(x, y) {
        if (this.targetCell != null) {
            this.targetCell.classList.remove('targeted');
        }
        if (this.status === 'SHOOTING' && !this.waitServer) {
            this.targetCell = self.enemyField.getCell(x, y);
            this.targetCell.classList.add('targeted');
        }
    };
    this._onEnemyFieldMouseLeave = function() {
        if (this.targetCell != null) {
            this.targetCell.classList.remove('targeted');
        }
    };
    this._setBattleStatusText = function(text, animate) {
        this.battleStatusElement.textContent = text;
        if (animate)
            this.battleStatusElement.classList.add('active');
        else
            this.battleStatusElement.classList.remove('active');
    };
    this.setBattleState = function(battleState) {
        this.waitServer = false;
        this.status = battleState.players[this.player];
        const enemyStatus = battleState.players[this.enemy];
        if (enemyStatus === 'NO_PLAYER') {
            this._setBattleStatusText('No opponent');
        }
        else if (enemyStatus === "PLACING_SHIPS") {
            this._setBattleStatusText('Opponent placing ships');
        }
        else if (this.status === 'WAITING') {
            this._setBattleStatusText('Opponent turn');
        }
        else if (this.status === 'SHOOTING') {
            this._setBattleStatusText('Your turn', true);
        }
        else if (this.status === 'WINNER') {
            this._setBattleStatusText('You win!');
        }
        else if (this.status === 'LOSER') {
            this._setBattleStatusText('You lose!');
        }
    };
    this.shot = function(shot) {
        const field = this.fields[shot.target];
        const fleet = this.fleets[shot.target];
        if (shot.result === 'MISS') {
            field.setCellState(shot.x, shot.y, CellState.empty);
        }
        else if (shot.result === 'HIT') {
            field.setCellState(shot.x, shot.y, CellState.occupied);
        }
        else if (shot.result === 'KILL' || shot.result === 'KILL_ALL') {
            const ship = new Ship(shot.killedShip.size);
            ship.setVertical(shot.killedShip.vertical);
            ship.setPosition(shot.killedShip.x, shot.killedShip.y);
            field.addShip(ship);
            field.setCellState(shot.x, shot.y, CellState.occupied);
            for (let x = ship.x - 1; x <= ship.x + ship.getSizeX(); x++) {
                field.setCellState(x, ship.y - 1, CellState.empty);
                field.setCellState(x, ship.y + ship.getSizeY(), CellState.empty);
            }
            for (let y = ship.y - 1; y <= ship.y + ship.getSizeY(); y++) {
                field.setCellState(ship.x - 1, y, CellState.empty);
                field.setCellState(ship.x + ship.getSizeX(), y, CellState.empty);
            }
            const sunkIndex = this._getSunkIndex(fleet, ship.size);
            fleet.ships[sunkIndex].setSunk(true);
        }
    };
    this._getSunkIndex = function(fleet, shipSize) {
        for(let i = 0; i < fleet.size; ++i) {
            const ship = fleet.ships[i];
            if (!ship.sunk && ship.size === shipSize) {
                return i;
            }
        }
    };
}

ui = {
    mainMenuScreen: document.getElementById('mainMenuScreen'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    startPrivateBattleButton: document.getElementById('startPrivateBattle'),
    placingShipsScreen: document.getElementById('placingShipsScreen'),
    placeShipsButton: document.getElementById('placeShips'),
    placeRandomlyButton: document.getElementById('placeRandomly'),
    resetFieldButton: document.getElementById('resetField'),
    placingGrid: document.querySelector('#placingShipsScreen .field-grid'),
    leaveBattleButton: document.getElementById('leaveBattle'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    battleScreen: document.getElementById('battleScreen'),
    modal: document.getElementById("modal"),
    privateBattleLink: document.getElementById('privateBattleLink'),
    battleLinkButton: document.getElementById('battleLinkButton'),
    copyBattleLink: document.getElementById('copyBattleLink'),
    battle: null,
    start: function(callbacks) {
        const self = this;
        this.callbacks = callbacks;

        this.placementController = new PlacementController({
            allPlaced: function(allPlaced) {
                if (allPlaced) {
                    self.placeShipsButton.classList.add('revealed');
                }
                else {
                    self.placeShipsButton.classList.remove('revealed');
                }
            },
        });
        this.placingShipsScreen.appendChild(this.placementController.field.element);
        this.placingShipsScreen.appendChild(this.placementController.fleet.element);

        this.battleController = new BattleController({
            shoot: callbacks.shoot,
        });
        this.battleScreen.appendChild(this.battleController.battleStatusElement);
        this.battleScreen.appendChild(this.battleController.fields[0].element);
        this.battleScreen.appendChild(this.battleController.fields[1].element);
        this.battleScreen.appendChild(this.battleController.fleets[0].element);
        this.battleScreen.appendChild(this.battleController.fleets[1].element);

        this.startBattleButton.onclick = function() {
            self.privateBattle = false;
            callbacks.startBattle();
        };
        this.startBotBattleButton.onclick = function() {
            self.privateBattle = false;
            callbacks.startBotBattle();
        };
        this.startPrivateBattleButton.onclick = function() {
            self.privateBattle = true;
            callbacks.startPrivateBattle();
        };
        this.leaveBattleButton.onclick = callbacks.leaveBattle;
        this.placeRandomlyButton.onclick = function() {self.placementController.placeRandomly()};
        this.resetFieldButton.onclick = function() {self.placementController.reset(self.battle)};
        this.placeShipsButton.onclick = function() {self._placeShips()};
        this.battleLinkButton.onclick = function() {self._showBattleLink()};
        this.copyBattleLink.onclick = function() {copyToClipboard(self.battle.url)};

        this.modal.onclick = function(event) {
            if (event.target === self.modal) {
                self.modal.style.display = "none";
            }
        }
    },
    showLoader: function(text) {
        this.mainMenuScreen.classList.remove('active');
        this.loader.classList.add('active');
        this.loaderText.textContent = text;
    },
    hideLoader: function() {
        this.loader.classList.remove('active');
    },
    showMainMenu: function() {
        this.hideLoader();
        this.mainMenuScreen.classList.add('active');
    },
    showBattle: function() {
        this.placingShipsScreen.classList.remove('active');
        this.battleScreen.classList.add('active');
    },
    joinBattle: function(battle, player) {
        this.battle = battle;
        this.hideLoader();
        this.leaveBattleButton.classList.add('revealed');
        this.placeShipsButton.classList.remove('revealed');
        this.placingShipsScreen.classList.add('active');
        this.placementController.reset(battle);
        this.battleController.reset(battle, player);

        if (this.privateBattle) {
            this._showBattleLink();
            this.battleLinkButton.classList.add('revealed');
        }
        else {
            this.battleLinkButton.classList.remove('revealed');
        }
    },
    setBattleState: function(battleState) {
        this.battleController.setBattleState(battleState);
    },
    shot: function(shot) {
        this.battleController.shot(shot);
    },
    _placeShips: function() {
        this.callbacks.placeShips(this.placementController.placedShips);
        this.showBattle();
        this.battleController.setPlayerShips(this.placementController.placedShips);
    },
    _showBattleLink: function(link) {
        this.privateBattleLink.href = this.battle.url;
        this.privateBattleLink.textContent = this.battle.url;
        this.modal.style.display = "block";
    },
};

server = {
    connect: function(callbacks) {
        this.callbacks = callbacks;
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        this.ws = new WebSocket(protocol + '://' + location.host + '/ws');
        this.ws.onopen = this.callbacks.connected;
        this.ws.onmessage = function(event) {server.onMessage(event);}
    },
    reconnect: function() {
        this.ws.close();
        this.connect(this.callbacks);
    },
    startBattle: function() {
        this.send({startBattle: {}});
    },
    startBotBattle: function() {
        this.send({startBotBattle: {}});
    },
    startPrivateBattle: function() {
        this.send({startPrivateBattle: {}});
    },
    joinBattle: function(battleId) {
        this.send({joinBattle: {battleId: battleId}});
    },
    placeShips: function(ships) {
        this.send({placeShips: {ships: ships}});
    },
    shoot: function(target, x, y) {
        this.send({shoot: {target: target, x: x, y: y}})
    },
    ping: function() {
        this.send({});
    },
    send: function(obj) {
        this.ws.send(JSON.stringify(obj));
    },
    onMessage: function(event) {
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
        if (serverMessage.error) {
            this.callbacks.error(serverMessage.error);
        }
    },
};

game = {
    start: function() {
        ui.start({
            startBattle: this.startBattle,
            startBotBattle: this.startBotBattle,
            startPrivateBattle: this.startPrivateBattle,
            leaveBattle: this.leaveBattle,
            placeShips: this.placeShips,
            shoot: this.shoot,
        });
        ui.showLoader("Connecting to the server...");
        server.connect({
            connected: this.onConnectedToServer,
            joinedToBattle: this.onJoinedToBattle,
            battleUpdate: this.onBattleUpdate,
            shot: this.onShot,
            error: this.onServerError,
        });
        setInterval(function(){server.ping()}, 5000);
    },
    // Server events
    onConnectedToServer: function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('battleId')) {
            const battleId = urlParams.get('battleId');
            ui.showLoader('Joining to the battle...');
            server.joinBattle(battleId);
        }
        else {
            ui.showMainMenu();
        }
    },
    onJoinedToBattle: function(joinedBattleEvent) {
        const battle = {
            id: joinedBattleEvent.battleId,
            url: createBattleUrl(joinedBattleEvent.battleId),
            playerCount: joinedBattleEvent.playerCount,
            fieldSize: joinedBattleEvent.fieldSize,
            shipSizes: joinedBattleEvent.shipSizes.sort(),
        };
        ui.joinBattle(battle, joinedBattleEvent.player);
    },
    onBattleUpdate: function(event) {
        ui.setBattleState(event);
    },
    onShot: function(event) {
        ui.shot(event);
    },
    onServerError: function(message) {
        ui.showLoader(message);
        ui.leaveBattleButton.classList.add('revealed');
    },
    // UI events
    startBattle: function() {
        ui.showLoader("Waiting for a battle...");
        server.startBattle();
    },
    startBotBattle: function() {
        ui.showLoader("Waiting for a battle...");
        server.startBotBattle();
    },
    startPrivateBattle: function() {
        ui.showLoader("Waiting for a battle...");
        server.startPrivateBattle();
    },
    leaveBattle: function() {
        window.location = '/';
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
    },
    shoot: function(target, x, y) {
        server.shoot(target, x, y)
    }
};

game.start();
