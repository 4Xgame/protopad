var roadTerrainType = new TerrainType({
    name: 'road',
    resourceMap: new TerrainResourceUseMap ({
        food: 6,
        water: 6
    })
})

var riverTerrainType = new TerrainType({
    name: 'rivers',
    resourceMap: new TerrainResourceUseMap ({
        food: 4,
        water: 4
    })
})

var forestTerrainType = new TerrainType({
    name: 'forest',
    resourceMap: new TerrainResourceUseMap ({
        food: 15,
        water: 25
    })
})

var plainsTerrainType = new TerrainType({
    name: 'plains',
    resourceMap: new TerrainResourceUseMap ({
        food: 15,
        water: 25
    })
})

var mountainTerrainType = new TerrainType({
    name: 'mountain',
    resourceMap: new TerrainResourceUseMap ({
        food: 30,
        water: 50
    })
})

var testMapGenerator = new MapGenerator({
    terrains: {
        road: roadTerrainType,
        forest: forestTerrainType,
        plains: plainsTerrainType,
        mountain: mountainTerrainType,
        river: riverTerrainType
    }
})