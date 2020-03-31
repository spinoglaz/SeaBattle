package ru.dasha.seabattle.bot;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.protocol.*;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ScheduledFuture;

@Component
public class Bot extends TextWebSocketHandler {
    private PlacementStrategy placementStrategy;
    private ShootingStrategy shootingStrategy;
    private ObjectMapper objectMapper;
    private TaskScheduler taskScheduler;

    private String battleId;
    private ShootingField[] fields;
    private int player;
    private int enemyPlayer;
    private ScheduledFuture<?> scheduledPing;

    public Bot(TaskScheduler taskScheduler) {
        objectMapper = new ObjectMapper();
        placementStrategy = new PlacementStrategy();
        shootingStrategy = new ShootingStrategy();
        this.taskScheduler = taskScheduler;
    }

    public void setBattleId(String battleId) {
        this.battleId = battleId;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("afterConnectionEstablished");
        joinBattle(session, battleId);
        scheduledPing = taskScheduler.scheduleAtFixedRate(() -> {
            try {
                sendPing(session);
            } catch (IOException e) {
            }
        }, 5000);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("afterConnectionClosed");
        scheduledPing.cancel(true);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ServerMessage serverMessage = objectMapper.readValue(message.getPayload(), ServerMessage.class);
        if(serverMessage.joinedToBattle != null) {
            fields = new ShootingField[serverMessage.joinedToBattle.playerCount];
            for (int i = 0; i < fields.length; i++) {
                fields[i] = new ShootingField(serverMessage.joinedToBattle.fieldSize);
            }
            player = serverMessage.joinedToBattle.player;
            enemyPlayer = player == 0 ? 1 : 0;
            List<Ship> ships = placementStrategy.placeShips(serverMessage.joinedToBattle.shipSizes, serverMessage.joinedToBattle.fieldSize);
            placeShips(session, ships);
        }
        if(serverMessage.shot != null) {
            ShootingField field = fields[serverMessage.shot.target];
            if(serverMessage.shot.result == ShootResultDTO.MISS) {
                field.miss(serverMessage.shot.x, serverMessage.shot.y);
            }
            if(serverMessage.shot.result == ShootResultDTO.HIT) {
                field.hit(serverMessage.shot.x, serverMessage.shot.y);
            }
            if(serverMessage.shot.result == ShootResultDTO.KILL || serverMessage.shot.result == ShootResultDTO.KILL_ALL) {
                ShipDTO ship = serverMessage.shot.killedShip;
                field.hit(serverMessage.shot.x, serverMessage.shot.y);
                field.kill(ship.x, ship.y, ship.size, ship.vertical);
            }
        }
        if(serverMessage.battleUpdate != null && serverMessage.battleUpdate.players[player] == PlayerStatusDTO.SHOOTING) {
            Shot shot = shootingStrategy.shoot(fields[enemyPlayer]);
            shoot(session, shot);
        }
        if(serverMessage.battleUpdate != null && serverMessage.battleUpdate.status == BattleStatusDTO.FINISHED) {
            session.close();
        }
        if(serverMessage.error != null) {
            System.out.println("Server error: " + message);
        }
    }

    private void joinBattle(WebSocketSession session, String battleId) throws IOException {
        JoinBattleCommand joinBattleCommand = new JoinBattleCommand();
        joinBattleCommand.battleId = battleId;
        send(session, joinBattleCommand);
    }

    private void placeShips(WebSocketSession session, List<Ship> ships) throws IOException {
        PlaceShipsCommand placeShipsCommand = new PlaceShipsCommand();
        placeShipsCommand.ships = new ShipDTO[ships.size()];
        for (int i = 0; i < ships.size(); i++) {
            ShipDTO shipDTO = new ShipDTO();
            Ship ship = ships.get(i);
            shipDTO.x = ship.x;
            shipDTO.y = ship.y;
            shipDTO.size = ship.size;
            shipDTO.vertical = ship.vertical;
            placeShipsCommand.ships[i] = shipDTO;
        }
        send(session, placeShipsCommand);
    }

    private void shoot(WebSocketSession session, Shot shot) throws IOException {
        ShootCommand shootCommand = new ShootCommand();
        shootCommand.x = shot.x;
        shootCommand.y = shot.y;
        shootCommand.target = enemyPlayer;
        send(session, shootCommand);
    }

    private void send(WebSocketSession session, JoinBattleCommand joinBattleCommand) throws IOException {
        ClientMessage clientMessage = new ClientMessage();
        clientMessage.joinBattle = joinBattleCommand;
        String payload = objectMapper.writeValueAsString(clientMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void send(WebSocketSession session, PlaceShipsCommand placeShipsCommand) throws IOException {
        ClientMessage clientMessage = new ClientMessage();
        clientMessage.placeShips = placeShipsCommand;
        String payload = objectMapper.writeValueAsString(clientMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void send(WebSocketSession session, ShootCommand shootCommand) throws IOException {
        ClientMessage clientMessage = new ClientMessage();
        clientMessage.shoot = shootCommand;
        String payload = objectMapper.writeValueAsString(clientMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void sendPing(WebSocketSession session) throws IOException {
        ClientMessage clientMessage = new ClientMessage();
        String payload = objectMapper.writeValueAsString(clientMessage);
        session.sendMessage(new TextMessage(payload));
    }
}
