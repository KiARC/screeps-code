export function spawnBasicCreepWithJob(spawn: StructureSpawn, job: string) {
  spawn.spawnCreep(
    [WORK, CARRY, MOVE],
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
}
