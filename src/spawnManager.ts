import * as _ from 'lodash';
import {Roles} from "./constants";
import {Helpers} from "./helper";
import {SourceTile} from "./SourceTile";
import {Harvester, Collector} from "./harvester";

export class SpawnManager {
    private static init():void{
        for (var key in Game.spawns) {
            var spawn = Game.spawns[key];
            var room = spawn.room;
            if(!room.memory.numHarvesterSpots){
                var numHarvestersRequired : number = 0;
                var sources : Source[] = Helpers.getSourcesByRoom(room, true);
                for(var sKey in sources){
                    var source = sources[sKey];
                    var tile = new SourceTile(source);
                    var lookAtResults : LookAtResult[] = room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
                    var terrainResults = _.filter(lookAtResults, function(x : LookAtResult){
                        return x.type == "terrain" && (x.terrain == "swamp" || x.terrain == "plain");
                    });
                    numHarvestersRequired += terrainResults.length;
                }
                room.memory.numHarvesterSpots = numHarvestersRequired;
                room.memory.numSafeSources = sources.length;
            } else {
                //harvester shit initialized
            }
        }
    }

    private static spawn():void{
        for(var key in Game.spawns) {
            var spawn = Game.spawns[key];
            var numHarvesters : number = Helpers.getNumberOfCreepsByRoleAndRoom(Roles.Harvester, spawn.room.name);
            var numCollectors : number = Helpers.getNumberOfCreepsByRoleAndRoom(Roles.Collector, spawn.room.name);
            var numKickstarters : number = Helpers.getNumberOfCreepsByRoleAndRoom(Roles.KickStarter, spawn.room.name);
            var needsKickstarters : boolean = (numHarvesters == 0 || numCollectors == 0) && numKickstarters < spawn.room.memory.numSafeSources;
            if(needsKickstarters){
                SpawnManager.spawnKickstarters(spawn);
            } else {
                if(numHarvesters < spawn.room.memory.numSafeSources){
                    console.log('need some harvesters');
                    SpawnManager.spawnHarvesters(spawn);
                } else if(numCollectors < numHarvesters * 2){
                    console.log('need some collectors');
                    SpawnManager.spawnCollectors(spawn);
                }
            }
        }
    }

    private static spawnKickstarters(spawn : Spawn) : void {
        var numKickstarters : number = Helpers.getNumberOfCreepsByRoleAndRoom(Roles.KickStarter, spawn.room.name);
        if (numKickstarters < spawn.room.memory.numSafeSources) {
            var name = spawn.createCreep([WORK, CARRY, MOVE], undefined, {role : Roles.KickStarter, homeRoomName : spawn.room.name});
            if(name != ERR_NOT_ENOUGH_ENERGY && name != ERR_BUSY){
                console.log('created new creep named ' + name);
            }
        }
    }

    private static spawnHarvesters(spawn : Spawn) : void {
        var numHarvesters : number = Helpers.getNumberOfCreepsByRoleAndRoom(Roles.Harvester, spawn.room.name);
        if(numHarvesters < spawn.room.memory.numSafeSources) {
            var spawnResult = Harvester.Spawn(spawn, spawn.room.energyCapacityAvailable);
            if(spawnResult != ERR_BUSY && spawnResult != ERR_NOT_ENOUGH_ENERGY){
                console.log('created new harvester named ' + spawnResult);
            }
        }
    }

    private static spawnCollectors(spawn : Spawn) : void {
        var spawnResult = Collector.Spawn(spawn, spawn.room.energyCapacityAvailable);
        if(spawnResult != ERR_BUSY && spawnResult != ERR_NOT_ENOUGH_ENERGY){
            console.log('created new collector named ' + spawnResult);
        }
    }

    public static run():void {
        this.init();
        this.spawn();
    }
}