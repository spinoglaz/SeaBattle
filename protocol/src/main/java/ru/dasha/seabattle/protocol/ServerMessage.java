package ru.dasha.seabattle.protocol;

public class ServerMessage {

    public JoinedBattleEvent joinedToBattle;
    public BattleUpdateEvent battleUpdate;
    public ShotEvent shot;
    public String error;
}
