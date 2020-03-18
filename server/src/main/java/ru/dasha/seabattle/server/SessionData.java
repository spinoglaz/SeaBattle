package ru.dasha.seabattle.server;

import org.springframework.web.socket.WebSocketSession;
import ru.dasha.seabattle.engine.Battle;

public class SessionData {

    public WebSocketSession session;
    public Battle battle;
    public int player;

    public SessionData(WebSocketSession session) {
        this.session = session;
    }
}
