import { findEnergy } from "utils/MiscFunctions";

export const roleHauler = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      findEnergy(creep);
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
