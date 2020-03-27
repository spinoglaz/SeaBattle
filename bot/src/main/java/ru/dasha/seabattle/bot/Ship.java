package ru.dasha.seabattle.bot;

public class Ship {
    public int x;
    public int y;
    public int size;
    public boolean vertical;

    public int getSizeX() {
        if(!vertical) {
            return size;
        }
        return 1;
    }
    public int getSizeY() {
        if(vertical) {
            return size;
        }
        return 1;
    }
}
