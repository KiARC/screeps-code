export var roleBuilder = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
      creep.say("🚧 build");
    }

    if (creep.memory.working) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        const closestTarget = creep.pos.findClosestByRange(targets)!;
        if (creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestTarget, {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
};
