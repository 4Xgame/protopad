DEBUG = false

window.debug = (callback) => {
    if (DEBUG) {
        callback()
    }
}

class ResourceType {
    constructor(params) {
        this.name = params.name
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
        var {name, resourceCostMap} = params
        this.id = TerrainType.typeId++

        this.name = name
        this.resourceCostMap = resourceCostMap
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

class Tile {
    constructor(params) {
        this.x = params.x
        this.y = params.y
        this.terrainType = params.terrainType
        this.improvements = {}
        this.resourcePools = {}
        this.resourceAvailabilityMap = {}
        this.tilemap = params.tilemap
    }

    addImprovement(improvement) {
        this.improvements[improvement.name] = improvement
    }

    removeImprovement(improvement) {
        delete this.improvements[improvement.name]
    }

    updateResourceRender(resourceType) {
        this.tilemap.putTileAt(this.resourceRenderValue(resourceType), this.x, this.y, true, 'resourcemap')
        const renderTile = this.tilemap.getTileAt(this.x, this.y, false, 'resourcemap')
        renderTile.alpha = 0.45
    }

    setResourceAvailability(resourceType, amount) {
        this.resourceAvailabilityMap[resourceType.name || resourceType] = amount
        this.updateResourceRender(resourceType)

        const renderTile = this.tilemap.getTileAt(this.x, this.y, false, 'resourcemap')
        //renderTile.alpha = 0.5 * amount/100 + 0.3

        if (!renderTile) { debugger }

        debug(() => {
            let camera = GameMap.game.cameras.main
            GameMap.game.add.text(
                renderTile.getLeft(camera),
                renderTile.getTop(camera),
                amount, {
                    font: "18px monospace",
                    fill: "#ffffff",
                    padding: { x: 20, y: 10 },
                    backgroundColor: "#000000"
                }
            )
        })

        const left = GameMap.map.getTile(this.x - 1, this.y)
        const right = GameMap.map.getTile(this.x + 1, this.y)
        const top = GameMap.map.getTile(this.x, this.y - 1)
        const bottom = GameMap.map.getTile(this.x, this.y + 1)

        left && left.getResourceAvailability(resourceType) && left.updateResourceRender(resourceType)
        right && right.getResourceAvailability(resourceType) && right.updateResourceRender(resourceType)
        top && top.getResourceAvailability(resourceType) && top.updateResourceRender(resourceType)
        bottom && bottom.getResourceAvailability(resourceType) && bottom.updateResourceRender(resourceType)
    }

    getResourceAvailability(resourceType) {
        return this.resourceAvailabilityMap[resourceType.name || resourceType]
    }

    cascadeResource(resourceType, availabilty) {
        this.setResourceAvailability(resourceType, availabilty)
        return availabilty - this.terrainType.resourceCost(resourceType)
    }

    resourceRenderValue(resourceType) {
        if (!resourceType) { debugger; }
        return 0

        const left = GameMap.map.getTile(this.x - 1, this.y)
        const right = GameMap.map.getTile(this.x + 1, this.y)
        const top = GameMap.map.getTile(this.x, this.y - 1)
        const bottom = GameMap.map.getTile(this.x, this.y + 1)

        if ((left && (left.getResourceAvailability(resourceType) || 0) <=0) ||
            (right && (right.getResourceAvailability(resourceType) || 0) <=0) ||
            (top && (top.getResourceAvailability(resourceType) || 0) <=0) ||
            (bottom && (bottom.getResourceAvailability(resourceType) || 0) <=0)) {
                return 1
        }

        return 0
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

    improvementRenderValue() {

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
        this.gameTiles = null

        // Static as global game state
        GameMap.game = game
        GameMap.map = null

        this.initTileMap()
    }

    initTileMap() {
        this.gameTiles = new Array(this.width)

        for(var i = 0; i < this.width; i++) {
            this.gameTiles[i] = new Array(this.height);
        }
        const terrainTileSet = this.tileMap.addTilesetImage("terrain_tiles");
        const terrain = this.tileMap.createBlankLayer('terrain', terrainTileSet, 0, 0); // layer index, tileset, x, y
        terrain.depth = 0
      
        const improvementTileSet = this.tileMap.addTilesetImage("improvement_tiles");
        const improvements = this.tileMap.createBlankLayer('improvement', improvementTileSet, 0, 0); // layer index, tileset, x, y
        improvements.depth = 1

        const resourceMapTileSet = this.tileMap.addTilesetImage("resourcemap_tiles");
        const resources = this.tileMap.createBlankLayer('resourcemap', resourceMapTileSet, 0, 0); // layer index, tileset, x, y
        resources.depth = 2
    }

    getTile(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null 
        }
        return this.gameTiles[x][y]
    }

    fillTileRect(layer, x, y, width, height, tileGenerator) {
        for(var i = y; i < y + height; i++) {
            for(var j = x; j < x + width; j++) {
                let tile = tileGenerator(this.tileMap, j, i)
                this.updateTile(layer, j, i, tile)
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

    cascade(resourceType, availabilty, x, y) {
        const tile = this.getTile(x, y)

        if (availabilty < 0 || !tile) {
            return;
        }

        var currentAvailabilty = tile.getResourceAvailability(resourceType)

        if (currentAvailabilty < availabilty || currentAvailabilty == null) {
            tile.setResourceAvailability(resourceType, availabilty)

            let remaining = tile.cascadeResource(resourceType, availabilty)

            this.cascade(resourceType, remaining, x - 1, y)
            this.cascade(resourceType, remaining, x + 1, y)
            this.cascade(resourceType, remaining, x, y + 1)
            this.cascade(resourceType, remaining, x, y - 1)

            //this.cascade(resourceType, remaining*0.7, x - 1, y + 1)
            //this.cascade(resourceType, remaining*0.7, x + 1, y + 1)
            //this.cascade(resourceType, remaining*0.7, x - 1, y - 1)
            //this.cascade(resourceType, remaining*0.7, x + 1, y - 1)
        }
    }
}

class MapGenerator {
    constructor(params) {
        this.tileMap = null;
        this.terrains = params.terrains
        this.resources = params.resources
    }

    addTileMap(tileMap) {
        this.tileMap = tileMap;
    }

    // must be called in the game's create state
    generateSimpleMap(map) {
        map.fillTileRect('terrain',0,0,map.width,map.height,this.terrains.plains.generator)

        map.fillTileRect('terrain',3,3,10,5, this.terrains.forest.generator)
        map.fillTileRect('terrain',2,2,8,6, this.terrains.forest.generator)
        map.fillTileRect('terrain',5,5,9,14, this.terrains.forest.generator)

        map.fillTileRect('terrain',0,12,9,2,this.terrains.mountain.generator)
        map.fillTileRect('terrain',8,11,3,2,this.terrains.mountain.generator)
        map.fillTileRect('terrain',10,9,2,3,this.terrains.mountain.generator)
        map.fillTileRect('terrain',12,0,2,10,this.terrains.mountain.generator)

        map.fillTileRect('terrain',0,2,30,2,this.terrains.river.generator)
        map.fillTileRect('terrain',10,2,2,10,this.terrains.river.generator)
        map.fillTileRect('terrain',10,10,4,2,this.terrains.river.generator)
        map.cascade(this.resources.food, 100, 14, 13)

        return map
    }
}
