package ru.dasha.seabattle.bot;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ru.dasha.seabattle.protocol.ClientMessage;
import ru.dasha.seabattle.protocol.JoinBattleCommand;

import java.io.IOException;

public class Bot extends TextWebSocketHandler {
    private String battleId;
    private PlacementStrategy placementStrategy;
    private ShootStrategy shootStrategy;
    private Field[] fields;
    private ObjectMapper objectMapper;

    public Bot(String battleId) {
        this.battleId = battleId;
        objectMapper = new ObjectMapper();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Connected to the server!!!");
        JoinBattleCommand joinBattleCommand = new JoinBattleCommand();
        joinBattleCommand.battleId = battleId;
        send(session, joinBattleCommand);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // TODO handle ServerMessage
        // TODO on JoinedBattleEvent -> call placementStrategy
        // TODO on ShotEvent -> update fields
        // TODO on BattleUpdateEvent with SHOOTING state -> call shootStrategy
        // TODO on BattleUpdateEvent with FINISHED state -> close session
        // TODO on ServerMessage.error -> log the error
    }


    private void send(WebSocketSession session, JoinBattleCommand joinBattleCommand) throws IOException {
        ClientMessage clientMessage = new ClientMessage();
        clientMessage.joinBattle = joinBattleCommand;
        String payload = objectMapper.writeValueAsString(clientMessage);
        session.sendMessage(new TextMessage(payload));
    }
}
