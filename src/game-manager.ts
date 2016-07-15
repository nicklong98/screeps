import {SpawnManager} from "./spawnManager";
import {CreepController} from "./creepController";

/**
 * Singleton object.
 * Since singleton classes are considered anti-pattern in Typescript, we can effectively use namespaces.
 * Namespace's are like internal modules in your Typescript application. Since GameManager doesn't need multiple instances
 * we can use it as singleton.
 */
export namespace GameManager {

    export function globalBootstrap() {

    }

    export function loop() {
        SpawnManager.run();
        CreepController.run();
    }

}