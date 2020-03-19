package ru.dasha.seabattle.bot;

public class Field {
    public enum Cell {
        UNCHARTED,
        EMPTY,
        OCCUPIED
    }

    Cell[] [] cell;
    int size;

    public Field(int size) {

    }

    public int getSize() {
        return size;
    }

    public Cell getCell(int x, int y) {
        return null;
    }

    public void miss(int x, int y) {

    }

    public void hit(int x, int y) {

    }

    public void kill(int x, int y, int size, boolean vertical) {

    }
}
