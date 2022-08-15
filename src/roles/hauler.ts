import { findEnergy } from "utils/MiscFunctions";

export const roleHauler = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      findEnergy(creep, true);
    } else {
      const closestReceiver = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure =>
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_CONTAINER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      })!;
      if (
        creep.transfer(closestReceiver, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(closestReceiver, {
          visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" },
          reusePath: 200
        });
      }
    }
  }
};
