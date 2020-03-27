package ru.dasha.seabattle.bot;

public class PlacementField {
    private final int PADDING = 5;
    private boolean[][] cells;
    private int size;

    public PlacementField(int size) {
        cells = new boolean[size + PADDING][size + PADDING];
        this.size = size;
    }

    public void addShip(Ship ship) {
        int sizeX = ship.getSizeX() + 2;
        int sizeY = ship.getSizeY() + 2;
        for (int x = ship.x - 1; x < ship.x + sizeX; x++) {
            for (int y = ship.y - 1; y < ship.y + sizeY; y++) {
                cells[x][y] = true;
            }
        }
    }

    public boolean fits(Ship ship) {
        int sizeX = ship.getSizeX();
        int sizeY = ship.getSizeY();
        if(ship.x < 0 || ship.y < 0 || ship.x + sizeX > size || ship.y + sizeY > size) {
            return false;
        }
        for (int x = ship.x; x < ship.x + sizeX; x++) {
            for (int y = ship.y; y < ship.y + sizeY; y++) {
                if (cells[x][y]) {
                    return false;
                }
            }
        }
        return true;
    }
}
