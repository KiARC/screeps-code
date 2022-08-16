import { findEnergy } from 'utils/MiscFunctions';

const priorities = [
  STRUCTURE_EXTENSION,
  STRUCTURE_SPAWN,
  STRUCTURE_TOWER,
  STRUCTURE_CONTAINER
];

export const roleHauler = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      findEnergy(creep, true);
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_CONTAINER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });
      var foundWork = false;
      for (const type of priorities) {
        const filtered = targets.filter(
          target => target.structureType === type
        );
        if (filtered.length) {
          foundWork = true;
          const closestTarget = creep.pos.findClosestByRange(filtered)!;
          if (
            creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
          ) {
            creep.moveTo(closestTarget, {
              visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" }
            });
          }
        }
        if (foundWork) break;
      }
    }
  }
};
