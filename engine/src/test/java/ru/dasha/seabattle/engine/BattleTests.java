package ru.dasha.seabattle.engine;

import org.junit.jupiter.api.Test;
import ru.dasha.seabattle.engine.exceptions.*;

import static org.junit.jupiter.api.Assertions.*;

public class BattleTests {

    @Test
    void constructor1() {
        // Act
        Battle battle = new Battle(2, 15, 10, new int[]{1, 2});

        // Assert
        assertEquals(BattleStatus.PLACING_SHIPS, battle.getStatus());
        assertEquals(15, battle.getFieldSizeX());
        assertEquals(10, battle.getFieldSizeY());
        assertNull(battle.getField(0));
        assertNull(battle.getField(1));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(1));
    }

    @Test
    void setField1() throws BattleException, ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 2});
        Field field = new Field(10, 10);
        field.placeShip(new Ship(1, 1, 1, true));
        field.placeShip(new Ship(3, 3, 2, true));

        // Act
        battle.setField(0, field);

        // Assert
        assertEquals(BattleStatus.PLACING_SHIPS, battle.getStatus());
        assertEquals(field, battle.getField(0));
        assertNull(battle.getField(1));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(1));
    }

    @Test
    void setField2() throws BattleException, ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);

        // Act
        battle.setField(1, field2);

        // Assert
        assertEquals(BattleStatus.SHOOTING, battle.getStatus());
        assertEquals(field1, battle.getField(0));
        assertEquals(field2, battle.getField(1));
        assertEquals(PlayerStatus.SHOOTING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(1));
    }

    @Test
    void setField3() throws BattleException, ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);
        Field field3 = new Field(10, 10);

        // Act
        assertThrows(WrongBattleStatusException.class, () -> {
            battle.setField(0, field3);
        });

        // Assert
        assertEquals(BattleStatus.SHOOTING, battle.getStatus());
        assertEquals(field1, battle.getField(0));
        assertEquals(field2, battle.getField(1));
        assertEquals(PlayerStatus.SHOOTING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(1));
    }

    @Test
    void setField4() throws ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 2});
        Field field = new Field(10, 10);
        field.placeShip(new Ship(1, 1, 1, true));
        field.placeShip(new Ship(3, 3, 1, true));

        // Act
        assertThrows(InvalidFieldException.class, () -> {
            battle.setField(0, field);
        });

        // Assert
        assertEquals(BattleStatus.PLACING_SHIPS, battle.getStatus());
        assertNull(battle.getField(0));
        assertNull(battle.getField(1));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(1));
    }

    @Test
    void setField5() throws BattleException, ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 2});
        Field field = new Field(10, 10);
        field.placeShip(new Ship(1, 1, 1, true));
        field.placeShip(new Ship(3, 3, 2, true));
        battle.setField(0, field);

        // Act
        assertThrows(WrongBattleStatusException.class, () -> {
            battle.setField(0, field);
        });

        // Assert
        assertEquals(BattleStatus.PLACING_SHIPS, battle.getStatus());
        assertEquals(field, battle.getField(0));
        assertNull(battle.getField(1));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(1));
    }

    @Test
    void setField6() throws BattleException, ShipPlacementException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 2});
        Field field = new Field(5, 10);

        // Act
        assertThrows(InvalidFieldException.class, () -> {
            battle.setField(0, field);
        });

        // Assert
        assertEquals(BattleStatus.PLACING_SHIPS, battle.getStatus());
        assertNull(battle.getField(0));
        assertNull(battle.getField(1));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.PLACING_SHIPS, battle.getPlayerStatus(1));
    }

    @Test
    void shoot1() throws ShipPlacementException, BattleException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);

        // Act
        ShootResult result = battle.shoot(0, 1, 1, 1);

        // Assert
        assertEquals(BattleStatus.SHOOTING, battle.getStatus());
        assertEquals(ShootResult.KILL, result);
        assertEquals(PlayerStatus.SHOOTING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(1));
    }

    @Test
    void shoot2() throws ShipPlacementException, BattleException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);

        // Act
        assertThrows(WrongBattleStatusException.class, () -> {
            battle.shoot(1, 0, 3, 3);
        });

        // Assert
        assertEquals(BattleStatus.SHOOTING, battle.getStatus());
        assertEquals(PlayerStatus.SHOOTING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(1));
    }

    @Test
    void shoot3() throws ShipPlacementException, BattleException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);
        battle.shoot(0, 1, 1, 1);


        // Act
        ShootResult result = battle.shoot(0, 1, 3, 3);

        // Assert
        assertEquals(BattleStatus.FINISHED, battle.getStatus());
        assertEquals(ShootResult.KILL_ALL, result);
        assertEquals(PlayerStatus.WINNER, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.LOSER, battle.getPlayerStatus(1));
    }

    @Test
    void shoot4() throws ShipPlacementException, BattleException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);
        battle.shoot(0, 1, 1, 1);
        battle.shoot(0, 1, 3, 3);

        // Act
        assertThrows(WrongBattleStatusException.class, () -> {
            battle.shoot(1, 0, 1, 1);
        });

        // Assert
        assertEquals(BattleStatus.FINISHED, battle.getStatus());
        assertEquals(PlayerStatus.WINNER, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.LOSER, battle.getPlayerStatus(1));
    }

    @Test
    void shoot5() throws ShipPlacementException, BattleException {
        Battle battle = new Battle(2, 10, 10, new int[]{1, 1});
        Field field1 = new Field(10, 10);
        field1.placeShip(new Ship(1, 1, 1, true));
        field1.placeShip(new Ship(3, 3, 1, true));
        Field field2 = new Field(10, 10);
        field2.placeShip(new Ship(1, 1, 1, true));
        field2.placeShip(new Ship(3, 3, 1, true));
        battle.setField(0, field1);
        battle.setField(1, field2);

        // Act
        assertThrows(WrongTargetException.class, () -> {
            battle.shoot(0, 0, 1, 1);
        });

        // Assert
        assertEquals(BattleStatus.SHOOTING, battle.getStatus());
        assertEquals(PlayerStatus.SHOOTING, battle.getPlayerStatus(0));
        assertEquals(PlayerStatus.WAITING, battle.getPlayerStatus(1));
    }
}
