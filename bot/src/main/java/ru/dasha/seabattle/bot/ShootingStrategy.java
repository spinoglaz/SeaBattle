package ru.dasha.seabattle.bot;

public class ShootingStrategy {
    public Shot shoot(ShootingField field) {
        int x;
        int y;
        do {
            x = (int) (Math.random() * field.getSize());
            y = (int) (Math.random() * field.getSize());
        } while (field.getCell(x, y) != ShootingField.Cell.UNCHARTED);
        Shot shot = new Shot();
        shot.x = x;
        shot.y = y;
        return shot;
    }
}
