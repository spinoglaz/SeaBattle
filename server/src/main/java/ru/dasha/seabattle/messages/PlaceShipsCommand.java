package ru.dasha.seabattle.messages;

public class PlaceShipsCommand {

    public Ship[] ships;

    public class Ship {
        public int x;
        public int y;
        public boolean vertical;
        public int size;
    }
}
