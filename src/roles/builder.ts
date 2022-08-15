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
        const notRoads = targets.filter(
          structure => structure.structureType !== STRUCTURE_ROAD
        );
        var target: ConstructionSite;
        if (notRoads.length) {
          target = notRoads[0];
        } else {
          target = targets[0];
        }
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" },
            reusePath: 200
          });
        }
      }
    } else {
      findEnergy(creep);
    }
  }
};
