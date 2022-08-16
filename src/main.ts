import 'utils/Room Extension';

import { roleBuilder } from 'roles/builder';
import { roleHarvester } from 'roles/harvester';
import { roleHauler } from 'roles/hauler';
import { roleUpgrader } from 'roles/upgrader';
import { ErrorMapper } from 'utils/ErrorMapper';
import { spawnCreepWithJob } from 'utils/MiscFunctions';
import { planContainers, planExtensions, planRoads } from 'utils/RoomPlanning';

declare global {
  interface Memory {
    uuid: number;
    log: any;
    sequencer: number;
    harvestedSources: Array<Source>;
    plannedRoads: Array<String>;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  interface Room {
    distanceTransform(
      initialCM: CostMatrix,
      enableVisuals: boolean,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): CostMatrix;
    diagonalDistanceTransform(
      initialCM: CostMatrix,
      enableVisuals: boolean,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): CostMatrix;
    walls(): CostMatrix;
    floodFill(seeds: Array<RoomPosition>, enableVisuals: boolean): CostMatrix;
  }
  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

if (Memory.sequencer === undefined) Memory.sequencer = 0; //Initialize sequencer if it isn't present
if (Memory.plannedRoads === undefined) Memory.plannedRoads = []; //Initialize sequencer if it isn't present

const creepMinimums = new Map([
  ["hauler", 2],
  ["harvester", 2],
  ["builder", 4],
  ["upgrader", 5]
]);

const smallCreepBodies = new Map<string, BodyPartConstant[]>([
  ["hauler", [CARRY, CARRY, MOVE, MOVE]], //Costs 200
  ["harvester", [WORK, WORK, MOVE]], //Costs 250, for pre-RCL2
  ["builder", [WORK, WORK, CARRY, MOVE]], //Costs 300
  ["upgrader", [WORK, WORK, CARRY, MOVE]] //Costs 300
]);

const bigCreepBodies = new Map<string, BodyPartConstant[]>([
  ["hauler", [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]], //Costs 300
  ["harvester", [WORK, WORK, WORK, WORK, WORK, MOVE]], //Costs 550
  ["builder", [WORK, WORK, CARRY, MOVE]], //Costs 300
  ["upgrader", [WORK, WORK, CARRY, CARRY, MOVE]] //Costs 350
]);

let bigCreeps = false;

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  if (Game.time % 50 === 0) {
    bigCreeps =
      Game.spawns["Spawn1"].room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_EXTENSION
      }).length >= 5;
    for (const name in Game.spawns) {
      const room = Game.spawns[name].room;
      if (!Memory.plannedRoads.includes(room.name)) {
        planRoads(room);
        Memory.plannedRoads.push(room.name);
      } else if (
        room.find(FIND_STRUCTURES, {
          filter: structure => structure.structureType === STRUCTURE_CONTAINER
        }).length < 5 &&
        room.find(FIND_CONSTRUCTION_SITES, {
          filter: structure => structure.structureType === STRUCTURE_CONTAINER
        }).length < 5
      ) {
        planContainers(room);
      }
      planExtensions(room);
    }
  }
  Memory.harvestedSources = Array();
  if (
    _(Memory.creeps)
      .filter({ role: "hauler" })
      .size() === 0
  ) {
    spawnCreepWithJob(
      Game.spawns["Spawn1"],
      "hauler",
      smallCreepBodies.get("hauler")!
    );
  } else if (
    _(Memory.creeps)
      .filter({ role: "harvester" })
      .size() === 0
  ) {
    spawnCreepWithJob(
      Game.spawns["Spawn1"],
      "harvester",
      smallCreepBodies.get("harvester")!
    );
  }
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
        case "harvester":
          roleHarvester.run(creep);
          continue;
        case "builder":
          roleBuilder.run(creep);
          continue;
        case "upgrader":
          roleUpgrader.run(creep);
          continue;
      }
    } else delete Memory.creeps[name];
  }
  for (const type of Array.from(creepMinimums.keys())) {
    const count = _(Memory.creeps)
      .filter({ role: type })
      .size();
    if (count < creepMinimums.get(type)!) {
      if (bigCreeps) {
        spawnCreepWithJob(
          Game.spawns["Spawn1"],
          type,
          bigCreepBodies.get(type)!
        );
      } else {
        spawnCreepWithJob(
          Game.spawns["Spawn1"],
          type,
          smallCreepBodies.get(type)!
        );
      }
      break;
    }
  }
});
