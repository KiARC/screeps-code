export function spawnCreepWithJob(
  spawn: StructureSpawn,
  job: string,
  body: BodyPartConstant[]
): ScreepsReturnCode {
  const ret = spawn.spawnCreep(
    body,
    job.concat("_", Memory.sequencer.toString()),
    {
      memory: {
        role: job,
        room: spawn.room.name,
        working: false
      }
    }
  );
  Memory.sequencer++;
  return ret;
}

declare var global: any;
global.spawnCreepWithJob = spawnCreepWithJob;

export function findEnergy(creep: Creep) {
  const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
    filter: resource => resource.resourceType == RESOURCE_ENERGY
  });
  const closestDropEnergy = creep.pos.findClosestByRange(droppedEnergy)!;
  if (creep.pickup(closestDropEnergy) == ERR_NOT_IN_RANGE) {
    creep.moveTo(closestDropEnergy, {
      visualizePathStyle: { stroke: "#00ff00", lineStyle: "solid" }
    });
  }
}
