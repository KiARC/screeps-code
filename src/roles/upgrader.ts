import { findEnergy } from "utils/MiscFunctions";

export const roleUpgrader = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
    } else if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
    }
    if (creep.memory.working) {
      if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller!, {
          visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" },
          reusePath: 200
        });
      }
    } else {
      findEnergy(creep);
    }
  }
};
