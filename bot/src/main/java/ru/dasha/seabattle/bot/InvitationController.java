package ru.dasha.seabattle.bot;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;

@RestController
public class InvitationController {
    private WebSocketClient client;
    private BeanFactory beanFactory;

    public InvitationController(BeanFactory beanFactory) {
        client = new StandardWebSocketClient();
        this.beanFactory = beanFactory;
    }

    @PostMapping("/invitations")
    public void acceptInvitation(@RequestBody Invitation invitation) {
        System.out.println("Got invitation " + invitation.url + " " + invitation.battleId);
        Bot bot = beanFactory.getBean(Bot.class);
        bot.setBattleId(invitation.battleId);
        client.doHandshake(bot, invitation.url);
    }
}
