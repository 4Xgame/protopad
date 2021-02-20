var riverTerrainType = new TerrainType({
    name: 'rivers',
    tileIndex: 1,
    resourceCostMap: {
        food: 4,
        water: 0
    }
})

var forestTerrainType = new TerrainType({
    name: 'forest',
    tileIndex: 3,
    resourceCostMap: {
        food: 25,
        water: 35
    }
})

var plainsTerrainType = new TerrainType({
    name: 'plains',
    tileIndex: 5,
    resourceCostMap: {
        food: 15,
        water: 25
    }
})

var mountainTerrainType = new TerrainType({
    name: 'mountain',
    tileIndex: 2,
    resourceCostMap: {
        food: 55,
        water: 55
    }
})

var food = new ResourceType({name: 'food', tileIndex: 0})
var water = new ResourceType({name: 'water', tileIndex: 1})

var testMapGenerator = new MapGenerator({
    terrains: {
        forest: forestTerrainType,
        plains: plainsTerrainType,
        mountain: mountainTerrainType,
        river: riverTerrainType
    },
    resources: {
        food: food,
        water: water
    }
})