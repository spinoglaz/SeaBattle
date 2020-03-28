package ru.dasha.seabattle.bot;

public class PlacementField {
    private boolean[][] cells;
    private int size;

    public PlacementField(int size) {
        cells = new boolean[size][size];
        this.size = size;
    }

    public void addShip(Ship ship) {
        int maxX = ship.x + ship.getSizeX() + 1;
        int maxY = ship.y + ship.getSizeY() + 1;
        int minX = ship.x - 1;
        int minY = ship.y - 1;
        if(minX < 0) {
            minX = 0;
        }
        if(minY < 0) {
            minY = 0;
        }
        if(maxX > size) {
            maxX = size;
        }
        if(maxY > size) {
            maxY = size;
        }
        for (int x = minX; x < maxX; x++) {
            for (int y = minY; y < maxY; y++) {
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
