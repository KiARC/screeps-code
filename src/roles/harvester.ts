export const roleHarvester = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    const sources = creep.room.find(FIND_SOURCES);
    const closestAvailableSource = creep.pos.findClosestByPath(
      sources.filter(source => !Memory.harvestedSources.includes(source))
    )!;
    if (creep.harvest(closestAvailableSource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(closestAvailableSource, {
        visualizePathStyle: { stroke: "#aa00ff", lineStyle: "solid" },
        reusePath: 200
      });
    } else {
      Memory.harvestedSources.push(closestAvailableSource);
    }
  }
};
