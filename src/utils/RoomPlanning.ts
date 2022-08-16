import { closestAtDistance } from './MiscFunctions';

interface Stamp {
  tiles: Array<{
    offset: { x: number; y: number };
    type:
      | STRUCTURE_EXTENSION
      | STRUCTURE_ROAD
      | STRUCTURE_WALL
      | STRUCTURE_RAMPART
      | STRUCTURE_TOWER
      | STRUCTURE_CONTAINER
      | STRUCTURE_STORAGE
      | STRUCTURE_LINK
      | STRUCTURE_EXTRACTOR
      | STRUCTURE_LAB
      | STRUCTURE_TERMINAL
      | STRUCTURE_FACTORY
      | STRUCTURE_SPAWN
      | STRUCTURE_OBSERVER
      | STRUCTURE_POWER_SPAWN
      | STRUCTURE_NUKER;
  }>;
}

//Stamps
const extensionPlusStamp: Stamp = {
  tiles: [
    { offset: { x: 0, y: 0 }, type: STRUCTURE_EXTENSION },
    { offset: { x: -1, y: 0 }, type: STRUCTURE_EXTENSION },
    { offset: { x: +1, y: 0 }, type: STRUCTURE_EXTENSION },
    { offset: { x: 0, y: +1 }, type: STRUCTURE_EXTENSION },
    { offset: { x: 0, y: -1 }, type: STRUCTURE_EXTENSION }
  ]
};

const containerPlusStamp: Stamp = {
  tiles: [
    { offset: { x: 0, y: 0 }, type: STRUCTURE_CONTAINER },
    { offset: { x: -1, y: 0 }, type: STRUCTURE_CONTAINER },
    { offset: { x: +1, y: 0 }, type: STRUCTURE_CONTAINER },
    { offset: { x: 0, y: +1 }, type: STRUCTURE_CONTAINER },
    { offset: { x: 0, y: -1 }, type: STRUCTURE_CONTAINER }
  ]
};

export function planRoads(room: Room) {
  const controller = room.controller!;
  const spawns = room.find(FIND_MY_SPAWNS);
  const sources = room.find(FIND_SOURCES);
  let costs = new PathFinder.CostMatrix();
  const roadPlan = new Array<RoomPosition>();
  for (const spawn of spawns) {
    const path = PathFinder.search(
      spawn.pos,
      { pos: controller.pos, range: 1 },
      {
        plainCost: 3,
        swampCost: 9,

        roomCallback: function(roomName) {
          if (!room) return false;
          return costs;
        }
      }
    ).path;
    for (const step of path) {
      costs.set(step.x, step.y, 1);
      roadPlan.push(step);
    }
  }

  for (const source of sources) {
    const path = PathFinder.search(
      source.pos,
      { pos: controller.pos, range: 1 },
      {
        plainCost: 3,
        swampCost: 9,

        roomCallback: function(roomName) {
          if (!room) return false;
          return costs;
        }
      }
    ).path;
    for (const step of path) {
      costs.set(step.x, step.y, 1);
      roadPlan.push(step);
    }
    for (const spawn of spawns) {
      const path = PathFinder.search(
        spawn.pos,
        { pos: source.pos, range: 1 },
        {
          plainCost: 3,
          swampCost: 9,

          roomCallback: function(roomName) {
            if (!room) return false;
            return costs;
          }
        }
      ).path;
      for (const step of path) {
        costs.set(step.x, step.y, 1);
        roadPlan.push(step);
      }
    }
  }
  roadPlan.forEach(step =>
    room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
  );
}
export function planContainers(room: Room) {
  const flood = room.floodFill([room.controller!.pos], false);
  const dist = room.distanceTransform(room.walls(), false, 0, 0, 49, 49);
  const position = closestAtDistance(flood, dist, room.name);
  stamp(containerPlusStamp, { x: position.x, y: position.y }, room);
}
export function planExtensions(room: Room) {
  const extensionCount =
    room.find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === "extension"
    }).length +
    room.find(FIND_CONSTRUCTION_SITES, {
      filter: structure => structure.structureType === "extension"
    }).length;

  const count =
    CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller!.level] -
    extensionCount;
  if (count === 0) return;
  //If RCL1 none can be built, and otherwise all have already been built
  else {
    const flood = room.floodFill([room.controller!.pos], false);
    const dist = room.distanceTransform(room.walls(), true, 0, 0, 49, 49);
    for (let i = count; i >= 5; i -= 5) {
      const position = closestAtDistance(flood, dist, room.name);
      stamp(extensionPlusStamp, { x: position.x, y: position.y }, room);
    }
  }
}

function stamp(template: Stamp, origin: { x: number; y: number }, room: Room) {
  for (const tile of template.tiles) {
    room.createConstructionSite(
      origin.x + tile.offset.x,
      origin.y + tile.offset.y,
      tile.type
    );
  }
}
