import * as _ from 'lodash';
import {Roles} from "./constants";
import {KickStarter} from "./harvester";
export class CreepController{
    public static run(){
        var kickStarters = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.KickStarter;
        });
        _.forEach(kickStarters, function(x : Creep){
            var kickStarter = new KickStarter(x);
            kickStarter.run();
        });
    }
}