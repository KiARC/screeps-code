export var roleHauler = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType == RESOURCE_ENERGY
      });
      const closestDropEnergy = creep.pos.findClosestByRange(droppedEnergy)!;
      if (creep.pickup(closestDropEnergy) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestDropEnergy, {
          visualizePathStyle: { stroke: "#ffaa00" }
        });
      }
    } else {
      const spawns = creep.room.find(FIND_MY_SPAWNS);
      const closestSpawn = creep.pos.findClosestByRange(spawns)!;
      if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSpawn, {
          visualizePathStyle: { stroke: "#ffaa00" }
        });
      }
    }
  }
};
