import { roleBuilder } from "roles/builder";
import { roleHarvester } from "roles/harvester";
import { roleHauler } from "roles/hauler";
import { roleUpgrader } from "roles/upgrader";
import { ErrorMapper } from "utils/ErrorMapper";
import { spawnCreepWithJob } from "utils/MiscFunctions";

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

if (Memory.sequencer === undefined) Memory.sequencer = 0; //Initialize sequencer if it isn't present

const creepMinimums = new Map([
  ["harvester", 2],
  ["hauler", 3],
  ["upgrader", 5],
  ["builder", 5]
]);

const creepBodies = new Map<string, BodyPartConstant[]>([
  //["harvester", [WORK, WORK, MOVE]], //Costs 250, for pre-RCL2
  ["harvester", [WORK, WORK, WORK, WORK, WORK, MOVE]], //Costs 550
  ["hauler", [CARRY, CARRY, MOVE, MOVE]], //Costs 200
  ["upgrader", [WORK, WORK, CARRY, CARRY, MOVE, MOVE]], //Costs 400
  ["builder", [WORK, WORK, CARRY, MOVE]] //Costs 300
]);

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  for (const name in Memory.creeps) {
    if (name in Game.creeps) {
      const creep = Game.creeps[name];
      switch (creep.memory.role) {
        case "harvester":
          roleHarvester.run(creep);
          continue;
        case "hauler":
          roleHauler.run(creep);
          continue;
        case "upgrader":
          roleUpgrader.run(creep);
          continue;
        case "builder":
          roleBuilder.run(creep);
          continue;
      }
    } else {
      // Garbage collector
      delete Memory.creeps[name];
    }
  }
  for (const type of Array.from(creepMinimums.keys())) {
    const count = _(Memory.creeps)
      .filter({ role: type })
      .size();
    if (count < creepMinimums.get(type)!) {
      spawnCreepWithJob(Game.spawns["Spawn1"], type, creepBodies.get(type)!);
      break;
    }
  }
});
