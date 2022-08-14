export const roleHarvester = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    const sources = creep.room.find(FIND_SOURCES);
    const closestSource = creep.pos.findClosestByRange(sources)!;
    if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(closestSource, {
        visualizePathStyle: { stroke: "#ffaa00" }
      });
    }
  }
};
