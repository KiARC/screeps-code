export function spawnCreepWithJob(spawn: StructureSpawn, job: string, body: BodyPartConstant[]) {
  spawn.spawnCreep(
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
}
