import { ErrorMapper } from 'utils/ErrorMapper';
import { spawnBasicCreepWithJob } from 'utils/MiscFunctions';

import { roleBuilder } from './roles/builder';
import { roleHarvester } from './roles/harvester';
import { roleUpgrader } from './roles/upgrader';

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    sequencer: number;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
if (Memory.sequencer === undefined) Memory.sequencer = 0; //Initialize sequencer if it isn't present
const creepMinimums = new Map([
  ["harvester", 3],
  ["upgrader", 1],
  ["builder", 2]
]);

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  for (const name in Memory.creeps) {
    if (name in Game.creeps) {
      var creep = Game.creeps[name];
      if (creep.memory.role == "harvester") {
        roleHarvester.run(creep);
      } else if (creep.memory.role == "upgrader") {
        roleUpgrader.run(creep);
      } else if (creep.memory.role == "builder") {
        roleBuilder.run(creep);
      }
    } else {
      // Garbage collector
      delete Memory.creeps[name];
    }
  }
  for (const type in creepMinimums.keys) {
  for (const type of Array.from(creepMinimums.keys())) {
    const count = _(Memory.creeps)
      .filter({ role: type })
      .size();
    if (count < creepMinimums.get(type)!) {
      Game.spawns["Spawn1"].spawnCreep(
        [WORK, CARRY, MOVE],
        type + "_" + Memory.sequencer,
        {
          memory: {
            role: type,
            room: Game.spawns["Spawn1"].room.name,
            working: false
          }
        }
      );
      Memory.sequencer++;
      spawnBasicCreepWithJob(Game.spawns["Spawn1"], type);
    }
  }
});
