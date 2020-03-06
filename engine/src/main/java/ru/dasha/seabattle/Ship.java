package ru.dasha.seabattle;

public class Ship {

    private boolean vertical;
    private int size;
    private boolean[] decks;
    private int x;
    private int y;
    private int brokenDeckCount;


    public Ship(int x, int y, int size, boolean vertical) {
        this.size = size;
        this.vertical = vertical;
        this.x = x;
        this.y = y;
        decks = new boolean[size];
        brokenDeckCount = 0;
    }

    public void shoot(int x, int y) {
        int deckIndex = 0;
        if(vertical) {
            if(x != this.x) {
                return;
            }
            if(y < this.y) {
                return;
            }
            if(y >= this.y + size) {
                return;
            }
            deckIndex = y - this.y;
        }
        else {
            if(y != this.y) {
                return;
            }
            if(x < this.x) {
                return;
            }
            if(x >= this.x + size) {
                return;
            }
            deckIndex = x - this.x;
        }
        if(!decks[deckIndex]) {
            decks[deckIndex] = true;
            brokenDeckCount++;
        }
    }

    public int getBrokenDeckCount() {
        return brokenDeckCount;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getSizeX() {
        if(vertical) {
            return 1;
        }
        else {
            return size;
        }
    }

    public int getSizeY() {
        if(vertical) {
            return size;
        }
        else {
            return 1;
        }
    }

    public boolean isVertical() {
        return vertical;
    }

    public int getSize() {
        return size;
    }
}
