package ru.dasha.seabattle.bot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SeabattleBotApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeabattleBotApplication.class, args);
	}

}
