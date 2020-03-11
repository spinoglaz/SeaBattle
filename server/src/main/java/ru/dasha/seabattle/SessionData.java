package ru.dasha.seabattle;

import org.springframework.web.socket.WebSocketSession;

public class SessionData {

    public WebSocketSession session;
    public Battle battle;
    public int player;

    public SessionData(WebSocketSession session) {
        this.session = session;
    }
}
