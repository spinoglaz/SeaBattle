package ru.dasha.seabattle;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.exceptions.InvalidFieldException;
import ru.dasha.seabattle.exceptions.ShipPlacementException;
import ru.dasha.seabattle.exceptions.WrongBattleStatusException;
import ru.dasha.seabattle.exceptions.WrongTargetException;
import ru.dasha.seabattle.messages.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private ObjectMapper objectMapper = new ObjectMapper();

    private Map<WebSocketSession, SessionData> sessions = new ConcurrentHashMap<>();
    private Map<Battle, List<WebSocketSession>> battleSessions = new ConcurrentHashMap<>();
    private Battle pendingBattle;
    private int pendingBattlePlayerCount;

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
        SessionData sessionData = sessions.get(session);
        if(pendingBattle != null) {
            sessionData.battle = pendingBattle;
            sessionData.player = pendingBattlePlayerCount;
            pendingBattlePlayerCount++;
            if(pendingBattlePlayerCount == pendingBattle.getPlayerCount()) {
                pendingBattle = null;
            }
        }
        else {
            pendingBattle = new Battle(2, 10, 10, new int[] {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
            sessionData.battle = pendingBattle;
            sessionData.player = 0;
            pendingBattlePlayerCount = 1;
            battleSessions.put(pendingBattle, new ArrayList<>(pendingBattle.getPlayerCount()));
        }
        battleSessions.get(sessionData.battle).set(sessionData.player, session);

        JoinedBattleEvent joinedBattle = new JoinedBattleEvent();
        joinedBattle.playerCount = sessionData.battle.getPlayerCount();
        joinedBattle.fieldSize = sessionData.battle.getFieldSizeX();
        joinedBattle.shipSizes = sessionData.battle.getShipSizes();
        joinedBattle.player = sessionData.player;
        send(session, joinedBattle);
    }

    private void startBotBattle(WebSocketSession session) {
        System.out.println("startBotBattle");
    }

    private void placeShips(WebSocketSession session, PlaceShipsCommand placeShips) throws IOException {
        SessionData sessionData = sessions.get(session);
        Battle battle = sessionData.battle;
        if(battle == null) {
            return;
        }
        Field field = new Field(battle.getFieldSizeX(), battle.getFieldSizeY());
        try {
            for(int i = 0; i < placeShips.ships.length; i++) {
                PlaceShipsCommand.Ship commandShip = placeShips.ships[i];
                Ship ship = new Ship(commandShip.x, commandShip.y, commandShip.size, commandShip.vertical);
                field.placeShip(ship);
            }
            battle.setField(sessionData.player, field);
        } catch (InvalidFieldException | WrongBattleStatusException | ShipPlacementException e) {
            return;
        }
        BattleUpdateEvent battleUpdate = createBattleUpdateEvent(battle);
        for (WebSocketSession battleSession: battleSessions.get(battle)) {
            send(battleSession, battleUpdate);
        }
    }

    private void shoot(WebSocketSession session, ShootCommand shoot) throws IOException {
        SessionData sessionData = sessions.get(session);
        Battle battle = sessionData.battle;
        try {
            battle.shoot(sessionData.player, shoot.target, shoot.x, shoot.y);
        } catch (WrongBattleStatusException | WrongTargetException e) {
            return;
        }
        BattleUpdateEvent battleUpdate = createBattleUpdateEvent(battle);
        ShotEvent shotEvent = new ShotEvent();
        shotEvent.x = shoot.x;
        shotEvent.y = shoot.y;
        shotEvent.player = sessionData.player;
        shotEvent.target = shoot.target;
        for (WebSocketSession battleSession: battleSessions.get(battle)) {
            send(battleSession, shotEvent);
            send(battleSession, battleUpdate);
        }
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
}