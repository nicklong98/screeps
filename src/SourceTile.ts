export class SourceTile{
    private source : Source;
    private numSpots : number;

    public get pos():RoomPosition {
        return this.source.pos;
    }

    public get id() : string{
        return this.source.id;
    }

    public get numHarvesterSpots() : number {
        return this.numSpots;
    }

    public constructor (source : Source){
        this.numSpots = 0;
        console.log('initializing source tile');
        if(this.numHarvesterSpots <= 0){
            console.log("shit there's 0 harvestable spots on this source");
        } else {
            console.log("Oh good I can harvest this shit");
        }
        if(!Memory.global.sources[source.id]){
            console.log('could not find source with id ' + source.id);
            Memory.global.sources[source.id] = this;
        } else {
            console.log('source with id ' + source.id + ' already in there');
        }
    }
}