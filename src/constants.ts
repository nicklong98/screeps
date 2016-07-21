export enum States{
    Working = 0,
    Returning = 1,
    Recycling = 2
}

export enum Roles{
    KickStarter = 0,
    Harvester = 1,
    Collector = 2,
    Upgrader = 3,
    Builder = 4
}

export class MagicNumbers{
    public static get MAX_NUM_CREEPS(){ return 50; }
}