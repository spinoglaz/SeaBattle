ui = {
    mainMenu: document.getElementById('mainMenu'),
    startBattleButton: document.getElementById('startBattle'),
    startBotBattleButton: document.getElementById('startBotBattle'),
    placingShips: document.getElementById('placingShips'),
    placingShipsField: document.querySelector('#placingShips .field'),
    placingShipsExitButton: document.getElementById('placingShipsExit'),
};

ui.startBattleButton.onclick = function() {
    ui.mainMenu.classList.remove('active');
    ui.placingShips.classList.add('active');
};

ui.placingShipsExitButton.onclick = function() {
    ui.placingShips.classList.remove('active');
    ui.mainMenu.classList.add('active');
};

ui.placingShipsField.oncontextmenu = function() {
    return false;
};

protocol = location.protocol === "https:" ? "wss" : "ws";
ws = new WebSocket(protocol + '://' + location.host + '/ws');
ws.onmessage = function(event){
    console.log(event);
};
ws.onopen = function(event){
    ws.send(JSON.stringify({
        startBattle: {},
    }));
};
