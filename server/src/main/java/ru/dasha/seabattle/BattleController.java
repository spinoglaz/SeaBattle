package ru.dasha.seabattle;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class BattleController {
    @MessageMapping("/startBattle")
    public void startBattle() {
        Battle battle = new Battle(2, 10, 10, new int[] {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
        System.out.println("startBattle");
    }
}
