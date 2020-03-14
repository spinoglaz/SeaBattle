package ru.dasha.seabattle.messages;

public class ServerMessage {

    public JoinedBattleEvent joinedToBattle;
    public BattleUpdateEvent battleUpdate;
    public ShotEvent shot;
    public String error;
}
