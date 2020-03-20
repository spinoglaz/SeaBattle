package ru.dasha.seabattle.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import kong.unirest.Unirest;
import kong.unirest.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.UUID;

@Component
public class BotInviter {
    private String botUrl;
    private String invitationUrl;
    private ObjectMapper objectMapper;

    public BotInviter(
            @Value("${botUrl}") String botUrl,
            @Value("${serverHost}") String serverHost,
            @Value("${server.port}") int serverPort
    ) {
        this.botUrl = botUrl;
        this.objectMapper = new ObjectMapper();
        this.invitationUrl = "ws://" + serverHost + ":" + serverPort + "/ws";
    }

    public void invite(UUID battleId) {
        try {
            String jsonBody = this.objectMapper.writeValueAsString(new HashMap<String, Object>() {{
                put("battleId", battleId.toString());
                put("url", invitationUrl);
            }});
            Unirest.post(this.botUrl)
                    .header("Content-Type", "application/json")
                    .body(new JSONObject(jsonBody))
                    .asJson()
                    .ifFailure(response -> {
                        System.out.println("Unirest error! " + response.getStatus());
                    });
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }
}
