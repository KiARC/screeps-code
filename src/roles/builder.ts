import { findEnergy } from "utils/MiscFunctions";

export var roleBuilder = {
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
        const closestTarget = creep.pos.findClosestByRange(targets)!;
        if (creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestTarget, {
            visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" }
          });
        }
      }
    } else {
      findEnergy(creep);
    }
  }
};
