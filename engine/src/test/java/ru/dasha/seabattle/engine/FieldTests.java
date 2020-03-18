package ru.dasha.seabattle.engine;

import org.junit.jupiter.api.Test;
import ru.dasha.seabattle.engine.exceptions.ShipPlacementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class FieldTests {

    @Test
    void constructor1() {
        // Act
        Field field = new Field(10, 15);

        // Assert
        assertEquals(10, field.getSizeX());
        assertEquals(15, field.getSizeY());
        assertEquals(0, field.getShips().size());
    }

    @Test
    void placeShipOverlap1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(0, 1, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipOverlap2() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(1, 3, 3, true));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(2, 4, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent2() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(5, 4, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent3() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(8, 4, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent4() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(2, 5, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent5() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(8, 5, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent6() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(2, 6, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent7() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(5, 6, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipAdjacent8() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(5, 5, 3, false));

        // Act
        assertThrows(ShipPlacementException.class, () -> {
            field.placeShip(new Ship(8, 6, 3, false));
        });

        // Assert
        assertEquals(1, field.getShips().size());
    }

    @Test
    void placeShipOk1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));

        // Act
        field.placeShip(new Ship(1, 5, 3, true));

        // Assert
        assertEquals(2, field.getShips().size());
    }

    @Test
    void shootMiss1() {
        // Arrange
        Field field = new Field(10, 15);

        // Act
        ShootResult result = field.shoot(1, 3);

        // Assert
        assertEquals(ShootResult.MISS, result);
    }

    @Test
    void shootMiss2() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));
        field.shoot(1, 1);

        // Act
        ShootResult result = field.shoot(1, 1);

        // Assert
        assertEquals(ShootResult.MISS, result);
    }

    @Test
    void shootHit1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));

        // Act
        ShootResult result = field.shoot(1, 2);

        // Assert
        assertEquals(ShootResult.HIT, result);
    }

    @Test
    void shootKillAll1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));
        field.shoot(1, 1);
        field.shoot(1, 3);

        // Act
        ShootResult result = field.shoot(1, 2);

        // Assert
        assertEquals(ShootResult.KILL_ALL, result);
    }

    @Test
    void shootKill1() throws ShipPlacementException {
        // Arrange
        Field field = new Field(10, 15);
        field.placeShip(new Ship(1, 1, 3, true));
        field.placeShip(new Ship(4, 4, 1, true));

        // Act
        ShootResult result = field.shoot(4, 4);

        // Assert
        assertEquals(ShootResult.KILL, result);
    }
}
