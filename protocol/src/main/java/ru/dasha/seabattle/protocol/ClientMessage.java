package ru.dasha.seabattle.protocol;

public class ClientMessage {

    public StartBattleCommand startBattle;
    public StartBotBattleCommand startBotBattle;
    public StartPrivateBattleCommand startPrivateBattle;
    public PlaceShipsCommand placeShips;
    public ShootCommand shoot;
    public JoinBattleCommand joinBattle;
}
