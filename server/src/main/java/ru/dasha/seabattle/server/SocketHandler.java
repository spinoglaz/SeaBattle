package ru.dasha.seabattle.server;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.engine.Battle;
import ru.dasha.seabattle.engine.Field;
import ru.dasha.seabattle.engine.Ship;
import ru.dasha.seabattle.engine.ShootResult;
import ru.dasha.seabattle.engine.exceptions.InvalidFieldException;
import ru.dasha.seabattle.engine.exceptions.ShipPlacementException;
import ru.dasha.seabattle.engine.exceptions.WrongBattleStatusException;
import ru.dasha.seabattle.engine.exceptions.WrongTargetException;
import ru.dasha.seabattle.protocol.*;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private ObjectMapper objectMapper = new ObjectMapper();

    private Map<WebSocketSession, SessionData> sessions = new ConcurrentHashMap<>();
    private Map<Battle, List<WebSocketSession>> battleSessions = new ConcurrentHashMap<>();
    private Map<UUID, Battle> battles = new HashMap<>();
    private Battle pendingBattle;
    private BotInviter botInviter;

    public SocketHandler(BotInviter botInviter) {
        this.botInviter = botInviter;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        ClientMessage clientMessage = objectMapper.readValue(message.getPayload(), ClientMessage.class);
        if(clientMessage.startBattle != null) {
            startBattle(session);
        }
        if(clientMessage.startBotBattle != null) {
            startBotBattle(session);
        }
        if(clientMessage.placeShips != null) {
            placeShips(session, clientMessage.placeShips);
        }
        if(clientMessage.shoot != null) {
            shoot(session, clientMessage.shoot);
        }
        if(clientMessage.joinBattle != null){
           UUID battleId = UUID.fromString(clientMessage.joinBattle.battleId);
           joinBattle(session, battleId);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        sessions.put(session, new SessionData(session));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        SessionData sessionData = sessions.get(session);
        if (sessionData.battle != null) {
            battleSessions.get(sessionData.battle).set(sessionData.player, null);
        }
        sessions.remove(session);
    }

    private void startBattle(WebSocketSession session) throws IOException {
        if(pendingBattle == null) {
            UUID id = createBattle();
            pendingBattle = battles.get(id);
        }

        joinBattle(session, pendingBattle);

        if(getFreeSession(pendingBattle) == -1) {
            pendingBattle = null;
        }
    }

    private void joinBattle(WebSocketSession session, UUID battleId) throws IOException {
        Battle battle = battles.get(battleId);
        if(battle == null) {
            sendErrorMessage(session, "No such battle");
            return;
        }
        joinBattle(session, battle);
    }

    private void joinBattle(WebSocketSession session, Battle battle) throws IOException {
        SessionData sessionData = sessions.get(session);
        sessionData.battle = battle;
        sessionData.player = getFreeSession(battle);
        battleSessions.get(sessionData.battle).set(sessionData.player, session);

        JoinedBattleEvent joinedBattle = new JoinedBattleEvent();
        joinedBattle.playerCount = sessionData.battle.getPlayerCount();
        joinedBattle.fieldSize = sessionData.battle.getFieldSizeX();
        joinedBattle.shipSizes = sessionData.battle.getShipSizes();
        joinedBattle.player = sessionData.player;
        send(session, joinedBattle);
    }

    private void startBotBattle(WebSocketSession session) throws IOException {
       UUID battleId = createBattle();
       joinBattle(session, battleId);
       botInviter.invite(battleId);
    }

    private UUID createBattle() {
        Battle battle = new Battle(2, 10, 10, new int[] {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
        UUID id = UUID.randomUUID();
        battles.put(id, battle);
        battleSessions.put(battle, Arrays.asList(new WebSocketSession[battle.getPlayerCount()]));
        return id;
    }

    private int getFreeSession(Battle battle){
        List<WebSocketSession> sessions = battleSessions.get(battle);
        for (int i = 0; i < sessions.size(); i++) {
            if(sessions.get(i) == null) {
                return i;
            }
        }
        return -1;
    }

    private void placeShips(WebSocketSession session, PlaceShipsCommand placeShips) throws IOException {
        SessionData sessionData = sessions.get(session);
        Battle battle = sessionData.battle;
        if(battle == null) {
            sendErrorMessage(session, "You're not in battle");
            return;
        }
        Field field = new Field(battle.getFieldSizeX(), battle.getFieldSizeY());
        try {
            for(int i = 0; i < placeShips.ships.length; i++) {
                ShipDTO commandShip = placeShips.ships[i];
                Ship ship = new Ship(commandShip.x, commandShip.y, commandShip.size, commandShip.vertical);
                field.placeShip(ship);
            }
            battle.setField(sessionData.player, field);
        } catch (InvalidFieldException e) {
            sendErrorMessage(session, "InvalidFieldException");
            return;
        } catch (WrongBattleStatusException e) {
            sendErrorMessage(session, "WrongBattleStatusException");
            return;
        } catch (ShipPlacementException e) {
            sendErrorMessage(session, "ShipPlacementException");
            return;
        }
        BattleUpdateEvent battleUpdate = createBattleUpdateEvent(battle);
        for (WebSocketSession battleSession: battleSessions.get(battle)) {
            if(battleSession != null) {
                send(battleSession, battleUpdate);
            }
        }
    }

    private void shoot(WebSocketSession session, ShootCommand shoot) throws IOException {
        SessionData sessionData = sessions.get(session);
        Battle battle = sessionData.battle;
        ShootResult shootResult;
        try {
            shootResult = battle.shoot(sessionData.player, shoot.target, shoot.x, shoot.y);
        } catch (WrongBattleStatusException e) {
            sendErrorMessage(session, "WrongBattleStatusException");
            return;
        } catch (WrongTargetException e) {
            sendErrorMessage(session, "WrongTargetException");
            return;
        }
        BattleUpdateEvent battleUpdate = createBattleUpdateEvent(battle);
        ShotEvent shotEvent = new ShotEvent();
        shotEvent.x = shoot.x;
        shotEvent.y = shoot.y;
        shotEvent.player = sessionData.player;
        shotEvent.target = shoot.target;
        switch (shootResult) {
            case MISS:
                shotEvent.result = ShootResultDTO.MISS;
                break;
            case HIT:
                shotEvent.result = ShootResultDTO.HIT;
                break;
            case KILL:
                shotEvent.result = ShootResultDTO.KILL;
                shotEvent.killedShip = convert(battle.getField(shoot.target).getShipAt(shoot.x, shoot.y));
                break;
            case KILL_ALL:
                shotEvent.result = ShootResultDTO.KILL_ALL;
                shotEvent.killedShip = convert(battle.getField(shoot.target).getShipAt(shoot.x, shoot.y));

                break;
        }
        for (WebSocketSession battleSession: battleSessions.get(battle)) {
            send(battleSession, shotEvent);
            send(battleSession, battleUpdate);
        }
    }

    private ShipDTO convert(Ship ship) {
        ShipDTO shipDTO = new ShipDTO();
        shipDTO.x = ship.getX();
        shipDTO.y = ship.getY();
        shipDTO.vertical = ship.isVertical();
        shipDTO.size = ship.getSize();
        return shipDTO;
    }

    private BattleUpdateEvent createBattleUpdateEvent(Battle battle) {
        BattleUpdateEvent battleUpdate = new BattleUpdateEvent();
        switch (battle.getStatus()) {
            case PLACING_SHIPS:
                battleUpdate.status = BattleStatusDTO.PLACING_SHIPS;
                break;
            case SHOOTING:
                battleUpdate.status = BattleStatusDTO.SHOOTING;
                break;
            case FINISHED:
                battleUpdate.status = BattleStatusDTO.FINISHED;
                break;
        }
        List<WebSocketSession> sessions = battleSessions.get(battle);
        battleUpdate.players = new PlayerStatusDTO[battle.getPlayerCount()];
        for (int i = 0; i < battle.getPlayerCount(); i++) {
            if (sessions.get(i) == null) {
                battleUpdate.players[i] = PlayerStatusDTO.NO_PLAYER;
                continue;
            }
            switch (battle.getPlayerStatus(i)) {
                case PLACING_SHIPS:
                    battleUpdate.players[i] = PlayerStatusDTO.PLACING_SHIPS;
                    break;
                case SHOOTING:
                    battleUpdate.players[i] = PlayerStatusDTO.SHOOTING;
                    break;
                case WAITING:
                    battleUpdate.players[i] = PlayerStatusDTO.WAITING;
                    break;
                case WINNER:
                    battleUpdate.players[i] = PlayerStatusDTO.WINNER;
                    break;
                case LOSER:
                    battleUpdate.players[i] = PlayerStatusDTO.LOSER;
                    break;
            }
        }

        return battleUpdate;
    }

    private void send(WebSocketSession session, JoinedBattleEvent joinedBattle) throws IOException {
        ServerMessage serverMessage = new ServerMessage();
        serverMessage.joinedToBattle = joinedBattle;
        String payload = objectMapper.writeValueAsString(serverMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void send(WebSocketSession session, BattleUpdateEvent battleUpdate) throws IOException {
        ServerMessage serverMessage = new ServerMessage();
        serverMessage.battleUpdate = battleUpdate;
        String payload = objectMapper.writeValueAsString(serverMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void send(WebSocketSession session, ShotEvent shot) throws IOException {
        ServerMessage serverMessage = new ServerMessage();
        serverMessage.shot = shot;
        String payload = objectMapper.writeValueAsString(serverMessage);
        session.sendMessage(new TextMessage(payload));
    }

    private void sendErrorMessage(WebSocketSession session, String errorMessage) throws IOException {
        ServerMessage serverMessage = new ServerMessage();
        serverMessage.error = errorMessage;
        String payload = objectMapper.writeValueAsString(serverMessage);
        session.sendMessage(new TextMessage(payload));
    }
}