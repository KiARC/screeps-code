Game.spawns['Spawn'].spawnCreep( [WORK, CARRY, MOVE], 'Basic' ); //Spawns a creep with basic traits
Game.creeps['Name'].memory.key = 'value'; //Assign a creep a value at a key in memory
Game.spawns['Spawn'].spawnCreep( [WORK, CARRY, MOVE], 'Basic', { memory: { role: 'creep' } } ); //Spawn creep with preset memory
