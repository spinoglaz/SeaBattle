package ru.dasha.seabattle.server;

import org.springframework.web.socket.WebSocketSession;

import java.util.UUID;

public class SessionData {

    public WebSocketSession session;
    public UUID battleId;
    public int player;

    public SessionData(WebSocketSession session) {
        this.session = session;
    }
}
