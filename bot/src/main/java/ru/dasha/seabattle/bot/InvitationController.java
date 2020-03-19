package ru.dasha.seabattle.bot;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;

@RestController
public class InvitationController {
    private WebSocketClient client;

    public InvitationController() {
        client = new StandardWebSocketClient();
    }

    @PostMapping("/invitations")
    public void acceptInvitation(@RequestBody Invitation invitation) {
        System.out.println("Got invitation " + invitation.url + " " + invitation.battleId);
        client.doHandshake(new Bot(invitation.battleId), invitation.url);
    }
}
