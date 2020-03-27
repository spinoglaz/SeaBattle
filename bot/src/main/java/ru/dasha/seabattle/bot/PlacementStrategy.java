package ru.dasha.seabattle.bot;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PlacementStrategy {

    private static class ShipPosition{
        private int x;
        private int y;
        private boolean vertical;

        public ShipPosition(int x, int y, boolean vertical) {
            this.x = x;
            this.y = y;
            this.vertical = vertical;
        }
    }

    public List<Ship> placeShips(int[] shipsSizes, int fieldSize) {
        List<Ship> ships = new ArrayList<>();
        List<ShipPosition> possiblePositions = generatePossiblePositions(fieldSize);
        Collections.shuffle(possiblePositions);
        PlacementField field = new PlacementField(fieldSize);
        Arrays.sort(shipsSizes);
        for (int i = shipsSizes.length - 1; i >= 0; i--) {
            int shipSize = shipsSizes[i];
            Ship ship = new Ship();
            ship.size = shipSize;
            for (ShipPosition position : possiblePositions) {
                ship.x = position.x;
                ship.y = position.y;
                ship.vertical = position.vertical;
                if (field.fits(ship)) {
                    field.addShip(ship);
                    ships.add(ship);
                    break;
                }
            }
        }
        return ships;
    }

    private List<ShipPosition> generatePossiblePositions(int fieldSize) {
        List<ShipPosition> shipPositions = new ArrayList<>();
        for (int x = 0; x < fieldSize; x++) {
            for (int y = 0; y < fieldSize; y++) {
                shipPositions.add(new ShipPosition(x, y, true));
                shipPositions.add(new ShipPosition(x, y, false));
            }
        }
        return shipPositions;
    }
}
