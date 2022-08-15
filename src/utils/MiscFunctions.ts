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

export function findEnergy(creep: Creep, ignoreContainers: boolean = false) {
  if (!ignoreContainers) {
    const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_CONTAINER &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    if (container !== undefined && container !== null) {
      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, {
          visualizePathStyle: { stroke: "#00ff00", lineStyle: "solid" }
        });
      }
      return;
    }
  }
  const droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: resource => resource.resourceType == RESOURCE_ENERGY
  })!;
  if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
    creep.moveTo(droppedEnergy, {
      visualizePathStyle: { stroke: "#00ff00", lineStyle: "solid" }
    });
  }
}
