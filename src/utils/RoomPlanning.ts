export function planRoads(room: Room) {
  console.log("Planning roads for " + room.name);
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
