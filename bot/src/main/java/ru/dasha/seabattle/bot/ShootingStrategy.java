package ru.dasha.seabattle.bot;

public class ShootingStrategy {
    public Shot shoot(ShootingField field) {
        int x;
        int y;
        for (x = 0; x < field.getSize(); ++x) {
            for (y = 0; y < field.getSize(); ++y) {
                if (field.getCell(x, y) == ShootingField.Cell.UNCHARTED && hasOccupiedNear(field, x, y)) {
                    return new Shot(x, y);
                }
            }
        }
        do {
            x = (int) (Math.random() * field.getSize());
            y = (int) (Math.random() * field.getSize());
        } while (field.getCell(x, y) != ShootingField.Cell.UNCHARTED);
        return new Shot(x, y);
    }

    private boolean hasOccupiedNear(ShootingField field, int x, int y) {
        return (x > 0 && field.getCell(x - 1, y) == ShootingField.Cell.OCCUPIED) ||
                (x < field.getSize() - 1 && field.getCell(x + 1, y) == ShootingField.Cell.OCCUPIED) ||
                (y > 0 && field.getCell(x, y - 1) == ShootingField.Cell.OCCUPIED) ||
                (y < field.getSize() - 1 && field.getCell(x, y + 1) == ShootingField.Cell.OCCUPIED);
    }
}
