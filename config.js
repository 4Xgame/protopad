var roadTerrainType = new TerrainType({
    name: 'road',
    resourceCostMap: {
        food: 6,
        water: 6
    }
})

var riverTerrainType = new TerrainType({
    name: 'rivers',
    resourceCostMap: {
        food: 4,
        water: 0
    }
})

var forestTerrainType = new TerrainType({
    name: 'forest',
    resourceCostMap: {
        food: 25,
        water: 35
    }
})

var plainsTerrainType = new TerrainType({
    name: 'plains',
    resourceCostMap: {
        food: 15,
        water: 25
    }
})

var mountainTerrainType = new TerrainType({
    name: 'mountain',
    resourceCostMap: {
        food: 55,
        water: 55
    }
})

var food = new ResourceType({name: 'food'})
var water = new ResourceType({name: 'water'})

var testMapGenerator = new MapGenerator({
    terrains: {
        road: roadTerrainType,
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