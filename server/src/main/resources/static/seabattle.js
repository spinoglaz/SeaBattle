var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    scene: {
        preload: preload,
        create: create
    },
};

var game = new Phaser.Game(config);

var txtStyle = {
    font: '18px Arial',
    fill: '#00ffff',
};

function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');
}

function create ()
{
    text = this.add.text(10, 10, '', txtStyle);

    protocol = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(protocol + '://' + location.host + '/ws');
    ws.onmessage = function(event){
        text.text += event.data;
        text.text += "\n";
    };
    ws.onopen = function(event){
        ws.send(JSON.stringify({
            startBattle: {},
        }));
    };
}