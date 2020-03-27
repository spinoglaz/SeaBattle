package ru.dasha.seabattle.bot;

public class ShootingField {
    public enum Cell {
        UNCHARTED,
        EMPTY,
        OCCUPIED
    }

    private Cell[][] cells;
    private int size;

    public ShootingField(int size) {
        this.size = size;
        cells = new Cell[size][size];
        for (int i = 0; i < cells.length; i++) {
            for (int j = 0; j < cells.length; j++) {
                cells[i][j] = Cell.UNCHARTED;
            }
        }
    }

    public int getSize() {
        return size;
    }

    public Cell getCell(int x, int y) {
        return cells[x][y];
    }

    public void miss(int x, int y) {
        cells[x][y] = Cell.EMPTY;
    }

    public void hit(int x, int y) {
        cells[x][y] = Cell.OCCUPIED;
    }

    public void kill(int x, int y, int size, boolean vertical) {
        int sizeX = vertical ? 1 : size;
        int sizeY = vertical ? size : 1;
        for (int i = x; i < x + sizeX; i++) {
            for (int j = y; j < y + sizeY; j++) {
                cells[i][j] = Cell.OCCUPIED;
            }
        }
    }
}
