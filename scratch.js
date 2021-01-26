class ResourceType {
    constructor(params) {
        var {name} = params
    }
}

class ResourcePool {

}

class ResourceProducer {
    constructor() {
    }
    
}

class ResourceConsumer {
    constructor() {
    }
    
}

class TerrainResourceUseMap {
    constructor(params) {
        this.map = params
    }

    useResource(resource, amt) {
        return amt - map[resource]
    }
}

class TerrainType {
    constructor(params) {
        var {name, resourceMap} = params
        this.id = TerrainType.typeId++

        this.name = name;
        this.resourceMap = resourceMap
    }

    generator() {
        return this.generateTile.bind(this)
    }
    
    generateTile() {
        return Tile.fromTerrainType(this)
    }
}
TerrainType.typeId = 0

class Improvement {
    constructor(params) {
    }
}

class Tile {
    constructor(params) {
        this.terrainType = params.terrainType
    }

    static fromTerrainType(terrainType) {
        return new Tile({terrainType: terrainType})
    }

    // the numbers map to the index in the tileset atlas image
    terrainRenderValue() {
        var terrain = {
            plains: 5,
            rivers: 1,
            mountain: 2,
            forest: 3
        }

        return terrain[this.terrainType.name] || 0
    }
}

class GameMap {
    // Must be called in the game's create state
    static create(params) {
        var {tileMap, width, height} = params;

        return new GameMap(tileMap, width, height)
    }

    // Don't call directly
    constructor(tileMap, width, height) {
        this.width = width
        this.height = height
        this.tileMap = tileMap

        this.gameTiles = new Array(width)

        for(var i = 0; i < width; i++) {
            this.gameTiles[i] = new Array(height);
        }

        this.initTileMap()
    }

    initTileMap() {
        const terrainTileSet = this.tileMap.addTilesetImage("terrain_tiles");
        this.tileMap.createBlankLayer('terrain', terrainTileSet, 0, 0); // layer index, tileset, x, y
      
        const improvementTileSet = this. tileMap.addTilesetImage("improvement_tiles");
        this.tileMap.createBlankLayer('improvement', improvementTileSet, 0, 0); // layer index, tileset, x, y
    }

    fillTileRect(layer, x, y, width, height, tileGenerator) {
        for(var i = y; i < y + height; i++) {
            for(var j = x; j < x + width; j++) {
                let tile = tileGenerator()
                this.updateTile('terrain', j, i, tile)
            }
        }
    }

    updateTile(layer, x, y, tile) {        
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            debugger;
        } else {
            this.tileMap.putTileAt(tile.terrainRenderValue(), x, y, true, layer)
            this.gameTiles[x][y] = tile
        } 
    }

    cascade(x, y, ) {

    }
}

class MapGenerator {
    constructor(params) {
        this.tileMap = null;
        this.terrains = params.terrains
    }

    addTileMap(tileMap) {
        this.tileMap = tileMap;
    }

    // must be called in the game's create state
    generateSimpleMap(map) {
        map.fillTileRect('terrain',0,0,50,37,this.terrains.plains.generator())

        map.fillTileRect('terrain',3,3,10,5, this.terrains.forest.generator())
        map.fillTileRect('terrain',2,2,8,6, this.terrains.forest.generator())
        map.fillTileRect('terrain',5,5,9,14, this.terrains.forest.generator())

        map.fillTileRect('terrain',0,12,9,2,this.terrains.mountain.generator())
        map.fillTileRect('terrain',8,11,3,2,this.terrains.mountain.generator())
        map.fillTileRect('terrain',10,9,2,3,this.terrains.mountain.generator())
        map.fillTileRect('terrain',11,0,2,10,this.terrains.mountain.generator())

        map.fillTileRect('terrain',0,2,30,2,this.terrains.river.generator())
        map.fillTileRect('terrain',10,2,2,10,this.terrains.river.generator())

        return map
    }
}
