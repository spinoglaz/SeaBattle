package ru.dasha.seabattle;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.messages.ClientMessage;
import ru.dasha.seabattle.messages.PlaceShipsCommand;
import ru.dasha.seabattle.messages.ShootCommand;

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

    private void startBattle(WebSocketSession session) {
        System.out.println("startBattle");
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
}