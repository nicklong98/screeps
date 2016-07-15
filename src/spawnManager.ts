import * as _ from 'lodash';
import {Roles} from "./constants";

export class SpawnManager {
    private static init():void{
        for (var key in Game.spawns) {
            var spawn = Game.spawns[key];
            var room = spawn.room;
            if(!room.memory.numHarvesterSpots){
                var numHarvestersRequired : number = 0;
                var sources : Source[] = room.find(FIND_SOURCES);
                for(var sKey in sources){
                    var source = sources[sKey];
                    var lookAtResults : LookAtResult[] = room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
                    var terrainResults = _.filter(lookAtResults, function(x : LookAtResult){
                        return x.type == "terrain" && (x.terrain == "swamp" || x.terrain == "plain");
                    });
                    numHarvestersRequired += terrainResults.length;
                }
                room.memory.numHarvesterSpots = numHarvestersRequired;
            } else {
                console.log("for room " + room.name + " " + room.memory.numHarvesterSpots + " harvester spots are open");
            }
        }
    }

    private static spawn():void{
        for(var key in Game.spawns) {
            var spawn = Game.spawns[key];
            var numKickstarters = _.filter(Game.creeps, function (x:Creep) {
                x.memory.role == Roles.KickStarter
            }).length;
            console.log("We have " + numKickstarters + " kick starters");
            if (numKickstarters < spawn.room.memory.numHarvesterSpots) {
                var name = spawn.createCreep([WORK, CARRY, MOVE], undefined, {role : Roles.KickStarter, homeRoomName : spawn.room.name});
                if(name != ERR_NOT_ENOUGH_ENERGY && name != ERR_BUSY){
                    console.log('created new creep named ' + name);
                }
            }
        }
    }

    public static run():void {
        this.init();
        this.spawn();
    }
}