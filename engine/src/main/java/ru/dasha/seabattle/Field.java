package ru.dasha.seabattle;

import ru.dasha.seabattle.exceptions.ShipPlacementException;

import java.util.ArrayList;
import java.util.List;

public class Field {

    private ArrayList<Ship> ships;
    private int sizeX;
    private int sizeY;

    public Field (int sizeX, int sizeY) {
        ships = new ArrayList<>();
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    public List<Ship> getShips() {
        return ships;
    }

    public int getSizeX() {
        return sizeX;
    }

    public int getSizeY() {
        return sizeY;
    }

    public void placeShip(Ship ship) throws ShipPlacementException {
        if (ship.getX() + ship.getSizeX() > sizeX) {
            throw new ShipPlacementException();
        }
        if (ship.getY() + ship.getSizeY() > sizeY) {
            throw new ShipPlacementException();
        }
        if(ship.getX() < 0) {
            throw new ShipPlacementException();
        }
        if (ship.getY() < 0) {
            throw new ShipPlacementException();
        }
        for (Ship placedShip : ships) {
            if(placedShip.getX() + placedShip.getSizeX() <= ship.getX() - 1) {
                continue;
            }
            if(placedShip.getX() >= ship.getX()  + ship.getSizeX() + 1) {
                continue;
            }
            if(placedShip.getY() + placedShip.getSizeY() <= ship.getY() - 1) {
                continue;
            }
            if (placedShip.getY() >= ship.getY() + ship.getSizeY() + 1) {
                continue;
            }
            throw new ShipPlacementException();
        }
        ships.add(ship);
    }

    public ShootResult shoot(int x, int y) {
        for (Ship ship : ships) {
            int brokenCountBefore = ship.getBrokenDeckCount();
            ship.shoot(x, y);
            int brokenCountAfter = ship.getBrokenDeckCount();
            if (brokenCountBefore == brokenCountAfter) {
                continue;
            }
            if (brokenCountAfter == ship.getSize()) {
                if(getDeadCount() == ships.size()) {
                    return ShootResult.KILL_ALL;
                }
                return ShootResult.KILL;
            }
            return ShootResult.HIT;
        }
        return ShootResult.MISS;
    }

    public int getDeadCount() {
        int deadCount = 0;
        for (Ship ship : ships) {
            if(ship.getBrokenDeckCount() == ship.getSize()) {
                deadCount++;
            }
        }
        return deadCount;
    }
}
