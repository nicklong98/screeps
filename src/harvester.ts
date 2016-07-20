import * as _ from 'lodash';

import {States, Roles} from "./constants";
import {Helpers} from "./helper";

export class KickStarter{
    private state : States;
    private creep : Creep;
    private source : Source;
    private repo : Structure;
    private homeRoom : Room;

    private init() : void{
        var creep = this.creep;
        if(!creep.memory.source){
            this.assignSource();
            creep.memory.state = States.Working;
        }
        if(!creep.memory.repo){
            this.assignRepo();
        }
        this.state = creep.memory.state;
        this.source = Game.getObjectById(creep.memory.source);
        this.repo = Game.getObjectById(creep.memory.repo);
        this.homeRoom = Game.rooms[creep.memory.homeRoomName];
    }

    private assignSource() : void {
        var sources = Helpers.getUnworkedSourcesByRoomAndRole(Game.rooms[this.creep.memory.homeRoomName], Roles.KickStarter);
        if(sources && sources.length > 0) {
            var source = this.creep.pos.findClosestByRange(sources);
            Helpers.assignSourceToCreep(source, this.creep);
            this.source = source;
        }
    }

    private assignRepo() : void {
        this.creep.memory.repo = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : function(s: Structure){
            return s.structureType == STRUCTURE_CONTAINER ||
                    s.structureType == STRUCTURE_SPAWN ||
                    s.structureType == STRUCTURE_EXTENSION;
        }}).id;
    }

    public constructor(creep : Creep){
        this.creep = creep;
        this.init();
    }

    public run() : void{
        if(this.state == States.Returning && this.creep.carry.energy == 0){
            this.state = States.Working;
        } else if(this.state == States.Working && this.creep.carry.energy >= this.creep.carryCapacity) {
            this.assignRepo();
            this.state = States.Returning;
        }

        switch (this.state){
            case States.Returning:
                if(this.creep.transfer(this.repo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    this.creep.moveTo(this.repo);
                }
                break;
            case States.Working:
                if(this.creep.harvest(this.source) == ERR_NOT_IN_RANGE){
                    this.creep.moveTo(this.source);
                }
                break;
        }
    }
}

export class Harvester
{
    private creep : Creep;
    private source : Source;
    private homeRoom : Room;

    public static Spawn(spawn : Spawn, energyCapacity : number) : string | number {
        var numBodyParts : number = Math.floor((energyCapacity - BODYPART_COST[MOVE]) / BODYPART_COST[WORK]);
        var body = [];
        if(numBodyParts > 0){
            body = body.concat(Helpers.createBodySegmentOfLength(WORK, numBodyParts));
            body = body.concat(Helpers.createBodySegmentOfLength(MOVE, 1));
            var result = spawn.createCreep(body, undefined, {role : Roles.Harvester, homeRoomName : spawn.room.name});
            return result;
        }
        return ERR_NOT_ENOUGH_ENERGY;
    }


    private init() : void{
        var creep = this.creep;
        if(!creep.memory.source){
            this.assignSource();
        }
        this.source = Game.getObjectById(creep.memory.source);
        this.homeRoom = Game.rooms[creep.memory.homeRoomName];
    }

    private assignSource() : void {
        var sources = Helpers.getUnworkedSourcesByRoomAndRole(Game.rooms[this.creep.memory.homeRoomName], Roles.Harvester);
        if(sources && sources.length > 0) {
            var source = this.creep.pos.findClosestByRange(sources);
            Helpers.assignSourceToCreep(source, this.creep);
            this.source = source;
        }
    }

    public constructor(creep : Creep){
        this.creep = creep;
        this.init();
    }

    public run() : void{
        if(this.creep.harvest(this.source) == ERR_NOT_IN_RANGE){
            this.creep.moveTo(this.source);
        }
    }
}

export class Collector {
    private creep:Creep;
    private repo:Structure;
    private energyDrop:Energy;

     public static Spawn(spawn : Spawn, energyCapacity : number) : string | number {
         var numBodyParts:number = Math.floor(energyCapacity / (BODYPART_COST[MOVE] + BODYPART_COST[CARRY]));
         console.log('spawning collector with ' + numBodyParts + ' segments');
         var body = Helpers.createBodySegmentOfLength(CARRY, numBodyParts);
         body = body.concat(Helpers.createBodySegmentOfLength(MOVE, numBodyParts));
         var result = spawn.createCreep(body, undefined, {role: Roles.Collector, homeRoomName: spawn.room.name});
         return result;
     }

    public constructor(creep:Creep) {
        this.creep = creep;
        this.init();
    }

    private init() : void {
        if (!this.creep.memory.state) {
            this.creep.memory.state = States.Working;
        }
        var state:States = this.creep.memory.state;
        if (state == States.Working) {
            if (!this.creep.memory.droppedEnergy || !Game.getObjectById(this.creep.memory.droppedEnergy)) {
                this.assignEnergy();
            }
        } else if (state == States.Returning) {
            if (!this.creep.memory.repo) {
                this.assignRepo();
            }
        }
    }

    private assignEnergy() : void {
        /*var energies = this.creep.room.find(FIND_DROPPED_RESOURCES, new {filter : function(x){
            return true;
        }});*/
        var energies = _.filter(this.creep.room.find(FIND_DROPPED_RESOURCES), function (x){
            var creepsAssigned = _.filter(Game.creeps, function(c : Creep){
                return c.memory.droppedEnergy && c.memory.droppedEnergy == x.id;
            });
            return (!creepsAssigned || creepsAssigned.length <= 0);
        });
        energies = _.sortBy(energies, function(x : Energy){ return x.amount; }).reverse();
        this.creep.memory.droppedEnergy = energies[0];
        this.energyDrop = energies[0];
        /*var energies = this.creep.room.find(FIND_DROPPED_RESOURCES, new {filter : function(x){
            var creepsAssigned = _.filter(Game.creeps, function(c : Creep){
                return c.memory.droppedEnergy && c.memory.droppedEnergy == x.id;
            });
            return (!creepsAssigned || creepsAssigned.length <= 0);
        }});
        /*var energies = this.creep.room.find(FIND_DROPPED_RESOURCES, new {filter : function(x : Energy){
            var creepsAssigned = _.filter(Game.creeps, function(c : Creep){
                return c.memory.droppedEnergy && c.memory.droppedEnergy == x.id;
            });
            return (!creepsAssigned || creepsAssigned.length <= 0);
        }});
        energies = _.sortBy(energies, function(x : Energy){ return x.amount; }).reverse();
        this.creep.memory.droppedEnergy = energies[0];
        this.energyDrop = energies[0];*/
    }

    private assignRepo() : void {
        this.repo = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : function(s: Structure){
            return s.structureType == STRUCTURE_CONTAINER ||
                ((s.structureType == STRUCTURE_SPAWN ||
                s.structureType == STRUCTURE_EXTENSION) && s.my);
        }});
        this.creep.memory.repo = this.repo.id;
    }

     /*private assignEnergy() : void {
     var energies = this.creep.room.find(FIND_DROPPED_RESOURCES, new {filter : function(x : Energy){
     var creepsAssigned = _.filter(Game.creeps, function(c : Creep){
     return c.memory.droppedEnergy && c.memory.droppedEnergy == x.id;
     });
     return (!creepsAssigned || creepsAssigned.length <= 0);
     }});
     energies = _.sortBy(energies, function(x : Energy){ return x.amount; }).reverse();
     this.creep.memory.droppedEnergy = energies[0];
     this.energyDrop = energies[0];
     }

     private assignRepo() : void {
     this.repo = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : function(s: Structure){
     return s.structureType == STRUCTURE_CONTAINER ||
     ((s.structureType == STRUCTURE_SPAWN ||
     s.structureType == STRUCTURE_EXTENSION) && s.my);
     }});
     this.creep.memory.repo = this.repo.id;
     }*/

    public run():void {
        console.log('running collector logic');
        var creep = this.creep;
        if (creep.memory.state == States.Returning && creep.carry.energy == 0) {
            this.assignEnergy();
            creep.memory.state = States.Working;
        } else if (creep.memory.state == States.Working && creep.carry.energy >= Math.floor(0.75 * creep.carryCapacity)) {
            this.assignRepo();
            creep.memory.state = States.Returning;
        }

        switch (creep.memory.state) {
            case States.Returning:
                if (creep.transfer(this.repo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(this.repo);
                }
                break;
            case States.Working:
                if (creep.pickup(this.energyDrop) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(this.energyDrop);
                }
                break;
        }
    }
}