import * as _ from 'lodash';
import {Helpers} from "./helper";
import {Roles, States} from "./constants";

export class Upgrader{
    private creep : Creep;
    private repo : Structure;
    private homeRoom : Room;

    public static Spawn(spawn : Spawn, availableEnergy : number) : number | string{
        var numBodySegments = Math.floor(availableEnergy / (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE] * 2));
        if(numBodySegments > 0){
            var body = Helpers.createBodySegmentOfLength(WORK, numBodySegments);
            body = body.concat(Helpers.createBodySegmentOfLength(CARRY, numBodySegments));
            body = body.concat(Helpers.createBodySegmentOfLength(MOVE, numBodySegments * 2));
            return spawn.createCreep(body, undefined, {role : Roles.Upgrader, homeRoomName : spawn.room.name});
        }
        return ERR_NOT_ENOUGH_ENERGY;
    }

    public constructor(creep : Creep){
        this.creep = creep;
        this.init();
    }

    private assignRepo() : void {
        this.repo = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : function(s: Structure){
            return s.structureType == STRUCTURE_CONTAINER ||
                s.structureType == STRUCTURE_SPAWN ||
                s.structureType == STRUCTURE_EXTENSION;
        }});
        this.creep.memory.repo = this.repo.id;
    }

    private init() : void{
        this.homeRoom = Game.rooms[this.creep.memory.homeRoomName];
        if(!this.creep.memory.repo){
            this.assignRepo();
        }
        if(!this.creep.memory.state){
            this.creep.memory.state = States.Returning;
        }
        this.repo = Game.getObjectById(this.creep.memory.repo);
    }

    public run() : void{
        if(this.creep.memory.state == States.Working && this.creep.carry.energy == 0){
            this.assignRepo();
            this.creep.memory.state = States.Returning;
        } else if(this.creep.memory.state == States.Returning && this.creep.carry.energy >= Math.floor(this.creep.carryCapacity * 0.75)){
            this.creep.memory.state = States.Working;
        }

        console.log(this.creep.memory.state);

        switch (this.creep.memory.state){
            case States.Returning:
                if(this.creep.withdraw(this.repo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    this.creep.moveTo(this.repo);
                }
                break;
            case States.Working:
                if(this.creep.upgradeController(this.homeRoom.controller) == ERR_NOT_IN_RANGE){
                    this.creep.moveTo(this.homeRoom.controller);
                }
                break;
            default:
                this.creep.memory.states = States.Returning;
                break;
        }
    }
}