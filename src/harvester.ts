import {States} from "./constants";
export class KickStarter{
    private state : States;
    private creep : Creep;
    private source : Source;
    private repo : Structure;

    private init() : void{
        var creep = this.creep;
        if(!creep.memory.source){
            var source : Source = creep.pos.findClosestByPath(FIND_SOURCES);
            var repo : Structure = source.pos.findClosestByPath(FIND_STRUCTURES, {filter : function(x : Structure){
                return (x.structureType == STRUCTURE_EXTENSION || x.structureType == STRUCTURE_SPAWN);
            }});
            creep.memory.source = source.id;
            creep.memory.repo = repo.id;
            this.source = source;
            this.repo = repo;
            creep.memory.state = States.Working;
        }
        this.state = creep.memory.state;
        this.source = Game.getObjectById(creep.memory.source);
        this.repo = Game.getObjectById(creep.memory.repo);
    }

    private assignNearestSource() : void {

    }

    private assignNearestRepo() : void {

    }

    public constructor(creep : Creep){
        this.creep = creep;
        this.init();
    }

    public run() : void{
        if(this.state == States.Returning && this.creep.carry.energy == 0){
            this.state = States.Working;
        } else if(this.state == States.Working && this.creep.carry.energy >= this.creep.carryCapacity) {
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