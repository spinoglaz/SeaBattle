package ru.dasha.seabattle.engine;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ShipTests {

    @Test
    void constructor1() {
        // Act
        Ship ship = new Ship(3, 2, 1, true);

        // Assert
        assertEquals(3, ship.getX());
        assertEquals(2, ship.getY());
        assertEquals(1, ship.getSizeY());
        assertEquals(0, ship.getBrokenDeckCount());
        assertTrue(ship.isVertical());
    }

    @Test
    void constructor2() {
        // Act
        Ship ship = new Ship(0, 0, 3, false);

        // Assert
        assertEquals(3, ship.getSize());
        assertEquals(3, ship.getSizeX());
        assertEquals(1, ship.getSizeY());
        assertEquals(0, ship.getBrokenDeckCount());
        assertFalse(ship.isVertical());
    }

    @Test
    void shoot1() {
        // Arrange
        Ship ship = new Ship(0, 0, 3, true);

        // Act
        ship.shoot(0, 0);

        // Assert
        assertEquals(1, ship.getBrokenDeckCount());
        assertEquals(3, ship.getSize());
    }

    @Test
    void shoot2() {
        // Arrange
        Ship ship = new Ship(0, 0, 3, true);
        ship.shoot(0, 0);

        // Act
        ship.shoot(0, 0);

        // Assert
        assertEquals(1, ship.getBrokenDeckCount());
    }

    @Test
    void shoot3() {
        // Arrange
        Ship ship = new Ship(0, 0, 3, true);
        ship.shoot(0, 0);

        // Act
        ship.shoot(1, 0);

        // Assert
        assertEquals(1, ship.getBrokenDeckCount());
    }

    @Test
    void shoot4() {
        // Arrange
        Ship ship = new Ship(0, 0, 3, true);
        ship.shoot(0, 0);

        // Act
        ship.shoot(0, 3);

        // Assert
        assertEquals(1, ship.getBrokenDeckCount());
    }

    @Test
    void shoot5() {
        // Arrange
        Ship ship = new Ship(0, 0, 3, false);
        ship.shoot(0, 0);

        // Act
        ship.shoot(1, 0);

        // Assert
        assertEquals(2, ship.getBrokenDeckCount());
    }

    @Test
    void shoot6() {
        // Arrange
        Ship ship = new Ship(2, 3, 3, false);

        // Act
        ship.shoot(2, 3);

        // Assert
        assertEquals(1, ship.getBrokenDeckCount());
    }

    @Test
    void shoot7() {
        // Arrange
        Ship ship = new Ship(2, 3, 3, false);

        // Act
        ship.shoot(1, 3);

        // Assert
        assertEquals(0, ship.getBrokenDeckCount());
    }

    @Test
    void shoot8() {
        // Arrange
        Ship ship = new Ship(2, 3, 3, false);

        // Act
        ship.shoot(2, 2);

        // Assert
        assertEquals(0, ship.getBrokenDeckCount());
    }
}
