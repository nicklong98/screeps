import {SpawnManager} from "./spawnManager";
import {CreepController} from "./creepController";
import {SourceTile} from "./SourceTile";
import {Helpers} from "./helper";

/**
 * Singleton object.
 * Since singleton classes are considered anti-pattern in Typescript, we can effectively use namespaces.
 * Namespace's are like internal modules in your Typescript application. Since GameManager doesn't need multiple instances
 * we can use it as singleton.
 */
export namespace GameManager {

    export function globalBootstrap() {
        //initialize the global memory
        if(!Memory.global){
            Memory.global = {};
        }
        //initialize the sources
        if(!Memory.global.sources){
            var sourceTiles : {[sourceId : string]: SourceTile;} = {};
            Memory.global.sources = sourceTiles;
            console.log('the sources have been initialized');
        }
    }

    export function loop() {
        Helpers.cleanDeadMemory();
        SpawnManager.run();
        CreepController.run();
    }

}