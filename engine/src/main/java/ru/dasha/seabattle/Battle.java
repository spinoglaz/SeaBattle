package ru.dasha.seabattle;

import ru.dasha.seabattle.exceptions.InvalidFieldException;
import ru.dasha.seabattle.exceptions.WrongBattleStatusException;
import ru.dasha.seabattle.exceptions.WrongTargetException;

import java.util.Arrays;

public class Battle {

    private Field[] fields;
    private BattleStatus status;
    private int[] shipSizes;
    private int fieldSizeX;
    private int fieldSizeY;
    private PlayerStatus[] playerStatuses;

    public Battle(int playerCount, int fieldSizeX, int fieldSizeY, int[] shipSizes) {
        fields = new Field[playerCount];
        this.fieldSizeX = fieldSizeX;
        this.fieldSizeY = fieldSizeY;
        this.shipSizes = shipSizes;
        status = BattleStatus.PLACING_SHIPS;
        playerStatuses = new PlayerStatus[playerCount];
        for (int i = 0; i < playerStatuses.length; i++) {
            playerStatuses[i] = PlayerStatus.PLACING_SHIPS;
        }
        Arrays.sort(shipSizes);
    }

    public Field getField(int player) {
        return fields[player];
    }

    public BattleStatus getStatus() {
        return status;
    }

    public PlayerStatus getPlayerStatus(int player) {
        return playerStatuses[player];
    }

    public int[] getShipSizes() {
        return shipSizes;
    }

    public int getFieldSizeX() {
        return fieldSizeX;
    }

    public int getFieldSizeY() {
        return fieldSizeY;
    }

    public int getPlayerCount() {
        return fields.length;
    }

    public void setField(int player, Field field) throws InvalidFieldException, WrongBattleStatusException {
        if(playerStatuses[player] != PlayerStatus.PLACING_SHIPS) {
            throw new WrongBattleStatusException();
        }
        checkField(field);

        fields[player] = field;

        playerStatuses[player] = PlayerStatus.WAITING;
        boolean allReady = true;
        for (int i = 0; i < playerStatuses.length ; i++) {
            if(playerStatuses[i] != PlayerStatus.WAITING) {
                allReady = false;
            }
        }
        if(allReady) {
            playerStatuses[0] = PlayerStatus.SHOOTING;
            status = BattleStatus.SHOOTING;
        }
    }

    public ShootResult shoot(int player, int target, int x, int y) throws WrongBattleStatusException, WrongTargetException {
        if(playerStatuses[player] != PlayerStatus.SHOOTING) {
            throw new WrongBattleStatusException();
        }
        if(target == player) {
            throw new WrongTargetException();
        }
        ShootResult result = fields[target].shoot(x, y);

        if(result == ShootResult.MISS) {
            playerStatuses[target] = PlayerStatus.SHOOTING;
            playerStatuses[player] = PlayerStatus.WAITING;
        }
        if (result == ShootResult.HIT) {
            playerStatuses[player] = PlayerStatus.SHOOTING;
            playerStatuses[target] = PlayerStatus.WAITING;
        }
        if (result == ShootResult.KILL) {
            playerStatuses[player] = PlayerStatus.SHOOTING;
            playerStatuses[target] = PlayerStatus.WAITING;
        }
        if(result == ShootResult.KILL_ALL) {
            playerStatuses[player] = PlayerStatus.WINNER;
            playerStatuses[target] = PlayerStatus.LOSER;
            status = BattleStatus.FINISHED;
        }
        return result;
    }

    private void checkField(Field field) throws InvalidFieldException {
        int[] shipSizes = new int[field.getShips().size()];
        for (int i = 0; i < shipSizes.length; i++) {
            shipSizes[i] = field.getShips().get(i).getSize();
        }
        Arrays.sort(shipSizes);
        if(!Arrays.equals(shipSizes, this.shipSizes)) {
            throw new InvalidFieldException();
        }
    }
}
