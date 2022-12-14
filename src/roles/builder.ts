import { findEnergy } from 'utils/MiscFunctions';

const priorities = [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
export const roleBuilder = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
    } else if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
    }
    if (creep.memory.working) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        var foundWork = false;
        for (const type of priorities) {
          const filtered = targets.filter(
            target => target.structureType === type
          );
          if (filtered.length) {
            foundWork = true;
            const closestTarget = creep.pos.findClosestByRange(filtered)!;
            if (creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
              creep.moveTo(closestTarget, {
                visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" }
              });
            }
          }
          if (foundWork) break;
        }
      }
    } else {
      findEnergy(creep);
    }
  }
};
