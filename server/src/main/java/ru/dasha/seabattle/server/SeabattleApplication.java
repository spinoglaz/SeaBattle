package ru.dasha.seabattle.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ru.dasha.seabattle.engine.Field;

@SpringBootApplication
public class SeabattleApplication {

	public static void main(String[] args) {
		Field field = new Field(10, 10);
		SpringApplication.run(SeabattleApplication.class, args);
	}

}
