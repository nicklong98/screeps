import * as _ from 'lodash';
import {Roles} from "./constants";
import {KickStarter, Harvester, Collector} from "./harvester";
import {Upgrader, Builder} from "./workers";
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
        var upgraders = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.Upgrader;
        });
        var builders = _.filter(Game.creeps, function(x : Creep){
            return x.memory.role == Roles.Builder;
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
        });
        _.forEach(upgraders, function(x : Creep){
            var upgrader = new Upgrader(x);
            upgrader.run();
        });
        _.forEach(builders, function(x : Creep){
            var builder = new Builder(x);
            builder.run();
        });
    }
}