DEBUG = false

window.debug = (callback) => {
    if (DEBUG) {
        callback()
    }
}

class ResourceType {
    constructor(params) {
        this.name = params.name
        this.tileIndex = params.tileIndex
    }
}

class ResourcePool {
    constructor(params) {
        this.name = params.name
        this.resourceType = params.resourceType
        this.id = ResourcePool.typeId++
        this.consumers = []
        this.producers = []
        this.amount = 0
    }
}
ResourcePool.id = 0

class ResourceProducer {
    constructor() {
    }
}

class ResourceConsumer {
    constructor() {
    }
    
}

class TerrainType {
    constructor(params) {
        this.id = TerrainType.typeId++
        
        this.tileIndex = params.tileIndex
        this.name = params.name
        this.resourceCostMap = params.resourceCostMap
    }

    get generator() {
        return this.generateTile.bind(this)
    }
    
    generateTile(tilemap, x, y) {
        return new Tile({
            terrainType: this ,
            tilemap: tilemap,
            x: x,
            y: y
        })
    }

    resourceCost(resourceType) {
        return this.resourceCostMap[resourceType.name || resourceType]
    }
}
TerrainType.typeId = 0

class Improvement {
    constructor(params) {
        var {name} = params
    }
}

class ImprovementType {
    constructor(params) {
        this.name = params.name
        this.tileIndex = params.tileIndex
        this.resourcesGenerated = params.resourcesGenerated || []
        this.width = params.width || 1
        this.height = params.height || 1 
    }

    generate() {
        return new Improvement({
            name : params.name,
            tileIndex : params.tileIndex
        })     
    } 
}

class GameMap {
    // Must be called in the game's create state
    static create(params) {
        var {tileMap, game, width, height} = params;

        GameMap.map = new GameMap(tileMap, game, width, height)
        return GameMap.map
    }

    // Don't call directly
    constructor(tileMap, game, width, height) {
        this.width = width
        this.height = height
        this.tileMap = tileMap
        this.terrainTiles = null
        this.resourceTiles = {}


        // Static as global game state
        GameMap.game = game
        GameMap.map = null

        this.initTileMap()
    }

    initTileMap() {
        this.terrainTiles = new Array(this.width)

        for(var i = 0; i < this.width; i++) {
            this.terrainTiles[i] = new Array(this.height);
        }
        const terrainTileSet = this.tileMap.addTilesetImage("terrain_tiles");
        this.terrainTiles = this.tileMap.createBlankLayer('terrain', terrainTileSet, 0, 0); // layer index, tileset, x, y
        this.terrainTiles.depth = 0
      
        const improvementTileSet = this.tileMap.addTilesetImage("improvement_tiles");
        this.improvementTiles = this.tileMap.createBlankLayer('improvement', improvementTileSet, 0, 0); // layer index, tileset, x, y
        this.improvementTiles.depth = 1

    }

    addResource(resourceType) {
        const resourceMapTileSet = this.tileMap.addTilesetImage("resourcemap_tiles");
        const resourceTileLayer = this.tileMap.createBlankLayer(`${resourceType.name}_resourcemap`, resourceMapTileSet, 0, 0);
        resourceTileLayer.depth = 2
        resourceTileLayer.alpha = 0.5

        this.resourceTiles[resourceType.name] = resourceTileLayer

        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                var resourceTile = this.tileMap.putTileAt(resourceType.tileIndex, x, y, true, `${resourceType.name}_resourcemap`)
                resourceTile.properties.availabilty = 0
                resourceTile.alpha = 0
            }
        }
    }

    getTile(layer, x, y) {
        return this.tileMap.getTileAt(x, y, false, layer)
    }

    fillTerrain(x, y, width, height, terrainType) {
        for(var i = y; i < y + height; i++) {
            for(var j = x; j < x + width; j++) {
                const terrainTile = this.tileMap.putTileAt(terrainType.tileIndex, j, i, true, 'terrain')
                terrainTile.properties.terrainType = terrainType
            }
        }
    }

    fillImprovement(x, y, width, height, terrainType) {

    }

    cascade(resourceType, availabilty, x, y) {
        const resourceTile = this.getTile(`${resourceType.name}_resourcemap`, x, y)
        const terrainTile = this.getTile('terrain', x, y)
        const improvementTile = this.getTile('improvement', x, y)

        if (availabilty < 0 || !resourceTile) {
            return;
        }

        if (resourceTile.properties.availabilty < availabilty) {
            resourceTile.properties.availabilty = availabilty
            resourceTile.alpha = 1.0

            debug(() => {
                let camera = GameMap.game.cameras.main
                GameMap.game.add.text(
                    renderTile.getLeft(camera),
                    renderTile.getTop(camera),
                    availabilty, {
                        font: "18px monospace",
                        fill: "#ffffff",
                        padding: { x: 20, y: 10 },
                        backgroundColor: "#000000"
                    }
                )
            })

            if (improvementTile && improvementTile.properties.resourcesGenerated[resourceType.name]) {
                var remaining = availabilty
            } else {
                var remaining = availabilty - terrainTile.properties.terrainType.resourceCost(resourceType)
            }
            
            this.cascade(resourceType, remaining, x - 1, y)
            this.cascade(resourceType, remaining, x + 1, y)
            this.cascade(resourceType, remaining, x, y + 1)
            this.cascade(resourceType, remaining, x, y - 1)
        }
    }

    addImprovement(improvementType, worldPoint) {
        var tile
        const tilePoint = this.tileMap.worldToTileXY(worldPoint.x, worldPoint.y, true)
        
        for(var i = tilePoint.y; i < tilePoint.y + improvementType.height; i++) {
            for(var j = tilePoint.x; j < tilePoint.x + improvementType.width; j++) {
                tile = this.tileMap.putTileAt(improvementType.tileIndex, j, i, true, 'improvement')
                if (!tile.properties.resourcesGenerated) {
                    tile.properties.resourcesGenerated = {}
                }
                improvementType.resourcesGenerated.forEach((improvementResource) => {
                    tile.properties.resourcesGenerated[improvementResource.type.name] = true
                })
            }
        }

        improvementType.resourcesGenerated.forEach((improvementResource) => {
            this.cascade(improvementResource.type, improvementResource.availability, tile.x, tile.y)
        })
    }
}

class MapGenerator {
    constructor(params) {
        this.gameMap = null;
        this.terrains = params.terrains
        this.resources = params.resources
    }

    addTileMap(gameMap) {
        this.gameMap = gameMap;
    }

    // must be called in the game's create state
    generateSimpleMap(gameMap) {
        gameMap.addResource(this.resources.food)
        gameMap.addResource(this.resources.water)
        
        gameMap.fillTerrain(0,0,gameMap.width,gameMap.height,this.terrains.plains)

        gameMap.fillTerrain(3,3,10,5, this.terrains.forest)
        gameMap.fillTerrain(2,2,8,6, this.terrains.forest)
        gameMap.fillTerrain(5,5,9,14, this.terrains.forest)

        gameMap.fillTerrain(0,12,9,2,this.terrains.mountain)
        gameMap.fillTerrain(8,11,3,2,this.terrains.mountain)
        gameMap.fillTerrain(10,9,2,3,this.terrains.mountain)
        gameMap.fillTerrain(12,0,2,10,this.terrains.mountain)

        gameMap.fillTerrain(0,2,30,2,this.terrains.river)
        gameMap.fillTerrain(10,2,2,10,this.terrains.river)
        gameMap.fillTerrain(10,10,4,2,this.terrains.river)
       
        gameMap.cascade(this.resources.water, 100, 0, 2)

        return gameMap
    }
}
