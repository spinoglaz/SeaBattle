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
        ui.loaderText.content = text;
    },
    hideLoader: function() {
        ui.loader.classList.remove('active');
    }
};

ui.startBattleButton.onclick = function() {
    ui.mainMenu.classList.remove('active');
    ui.showLoader("Waiting for a battle...");
    ws.send(JSON.stringify({
        startBattle: {},
    }));
};

ui.placingShipsExitButton.onclick = function() {
    ui.placingShips.classList.remove('active');
    ui.mainMenu.classList.add('active');
};

ui.placingShipsField.oncontextmenu = function() {
    return false;
};

ui.showLoader("Connecting to the server...");
protocol = location.protocol === "https:" ? "wss" : "ws";
ws = new WebSocket(protocol + '://' + location.host + '/ws');
ws.onmessage = function(event){
    var serverMessage = JSON.parse(event.data);
    if (serverMessage.joinedToBattle) {
        ui.hideLoader();
        ui.placingShips.classList.add('active');
    }
};
ws.onopen = function(event){
    ui.hideLoader();
    ui.mainMenu.classList.add('active');
};
