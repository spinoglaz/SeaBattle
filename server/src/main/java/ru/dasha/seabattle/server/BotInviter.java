package ru.dasha.seabattle.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import kong.unirest.Unirest;
import kong.unirest.json.JSONObject;

import java.util.HashMap;
import java.util.UUID;

public class BotInviter {
    private String url;
    private ObjectMapper objectMapper;

    public BotInviter(String url){
        this.url = url;
        this.objectMapper = new ObjectMapper();
    }

    public void invite(UUID battleId) {
        try {
            String jsonBody = this.objectMapper.writeValueAsString(new HashMap<String, Object>() {{
                put("battleId", battleId.toString());
                put("url", "ws://localhost:8080/ws");  // TODO env variable
            }});
            Unirest.post(this.url)
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
