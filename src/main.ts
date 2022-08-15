import { roleBuilder } from 'roles/builder';
import { roleHarvester } from 'roles/harvester';
import { roleHauler } from 'roles/hauler';
import { roleUpgrader } from 'roles/upgrader';
import { ErrorMapper } from 'utils/ErrorMapper';
import { spawnCreepWithJob } from 'utils/MiscFunctions';

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
    harvestedSources: Array<Source>;
    roadMaps: { [name: string]: number[][] | undefined };
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    lastDirection: DirectionConstant;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

  interface Creep {
    _move(direction: DirectionConstant): CreepMoveReturnCode;
    _move(
      target: Creep
    ): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS;
  }
}

if (!Creep.prototype._move) {
  Creep.prototype._move = Creep.prototype.move;

  Creep.prototype.move = function move(to: any): any {
    if (to === this.memory.lastDirection) {
      this.pos.createConstructionSite(STRUCTURE_ROAD);
    }
    Memory.roadMaps[this.room.name]![this.pos.y][this.pos.x] = 0;
    return this._move(to);
  };
}

if (Memory.sequencer === undefined) Memory.sequencer = 0; //Initialize sequencer if it isn't present
if (Memory.roadMaps === undefined) {
  const map: { [name: string]: number[][] } = {};
  for (const name in Game.rooms) {
    const room = Game.rooms[name];
    map[room.name] = new Array(50).fill(0).map(() => new Array(50).fill(0));
  }
  Memory.roadMaps = map;
}

const creepMinimums = new Map([
  ["hauler", 2],
  ["harvester", 2],
  ["builder", 5],
  ["upgrader", 5]
]);

const smallCreepBodies = new Map<string, BodyPartConstant[]>([
  ["hauler", [CARRY, CARRY, MOVE, MOVE]], //Costs 200
  ["harvester", [WORK, WORK, MOVE]], //Costs 250
  ["builder", [WORK, WORK, CARRY, MOVE]], //Costs 300
  ["upgrader", [WORK, WORK, CARRY, MOVE]] //Costs 300
]);

const bigCreepBodies = new Map<string, BodyPartConstant[]>([
  ["hauler", [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]], //Costs 300
  ["harvester", [WORK, WORK, WORK, WORK, WORK, MOVE]], //Costs 550
  ["builder", [WORK, WORK, CARRY, MOVE]], //Costs 300
  ["upgrader", [WORK, WORK, CARRY, CARRY, MOVE]] //Costs 350
]);

var bigCreeps = false;

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  var map = Memory.roadMaps[Game.spawns["Spawn1"].room.name]!;
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (
        Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.pos.x == j &&
            structure.pos.y == i &&
            structure.structureType == STRUCTURE_ROAD
        }).length > 0
      ) {
        map[i][j]++;
      } else {
        map[i][j] = 0;
      }
    }
  }
  Memory.roadMaps[Game.spawns["Spawn1"].room.name] = map;
  if (Game.time % 15 === 0) {
    bigCreeps =
      Game.spawns["Spawn1"].room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_EXTENSION
      }).length >= 5;
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
  if (Game.time % 150 === 0) {
    const unusedRoads = Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType == STRUCTURE_ROAD &&
        Memory.roadMaps[Game.spawns["Spawn1"].room.name]![structure.pos.y][
          structure.pos.x
        ] > 300
    });
    console.log("Pruning " + unusedRoads.length + " unused roads...");
    for (const road of unusedRoads) {
      road.destroy();
    }
    if (Game.time % 300 === 0) {
      const roadSites = Game.spawns["Spawn1"].room.find(
        FIND_CONSTRUCTION_SITES,
        {
          filter: site =>
            site.my === true &&
            site.structureType === STRUCTURE_ROAD &&
            site.progress === 0
        }
      );
      console.log("Pruning " + roadSites.length + " road sites...");
      for (const road of roadSites) {
        road.remove();
      }
      // if (
      //   Game.spawns["Spawn1"].room.find(FIND_MY_STRUCTURES, {
      //     filter: structure => structure.structureType === STRUCTURE_EXTENSION
      //   }).length <
      //   Game.spawns["Spawn1"].room.controller!.level * 5
      // ) {
      //   const terrain = Game.map.getRoomTerrain(Game.spawns["Spawn1"].room.name);
      // }
    }
  }
  for (const name in Memory.creeps) {
    if (name in Game.creeps) {
      const creep = Game.creeps[name];
      switch (creep.memory.role) {
        case "hauler":
          roleHauler.run(creep);
          continue;
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
