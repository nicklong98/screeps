import * as _ from 'lodash';
import {Roles} from "./constants";
import {KickStarter, Harvester, Collector} from "./harvester";
export class CreepController{
    public static run(){
        var kickStarters = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.KickStarter;
        });
        var harvesters = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.Harvester;
        });
        var collectors = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.Collector;
        });
        _.forEach(kickStarters, function(x : Creep){
            var kickStarter = new KickStarter(x);
            kickStarter.run();
        });
        _.forEach(harvesters, function(x : Creep){
            var harvester = new Harvester(x);
            harvester.run();
        });
        _.forEach(collectors, function(x : Creep){
            var collector = new Collector(x);
            collector.run();
            //fuck
        });
    }
}