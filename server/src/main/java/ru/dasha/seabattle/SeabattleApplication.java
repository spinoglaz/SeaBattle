package ru.dasha.seabattle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SeabattleApplication {

	public static void main(String[] args) {
		Field field = new Field(10, 10);
		SpringApplication.run(SeabattleApplication.class, args);
	}

}
