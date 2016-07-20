import {States} from "./constants";
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
        var sources = Helpers.getUnworkedSourcesByRoom(Game.rooms[this.creep.memory.homeRoomName]);
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