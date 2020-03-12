package ru.dasha.seabattle;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.messages.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private ObjectMapper objectMapper = new ObjectMapper();

    private Map<WebSocketSession, SessionData> sessions = new ConcurrentHashMap<>();
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
        }
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

    private void placeShips(WebSocketSession session, PlaceShipsCommand placeShips) {
        System.out.println("placeShips");
    }

    private void shoot(WebSocketSession session, ShootCommand shoot) {
        System.out.println("shoot");
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