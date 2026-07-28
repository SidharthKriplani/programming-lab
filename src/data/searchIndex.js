// searchIndex — PL v1 client-side search index: room + module TITLES only, no content
// search, no scoring. Built once from foundationsRooms.js (13 rooms; ~180 KNOW modules
// including the authored KNOW_EXTRA additions via clusterModules()).
// Consumed by components/SearchModal.jsx. See that file for the navigation-granularity
// flag (module hits resolve to their ROOM — PL has no per-module route yet).
import { FOUNDATION_ROOMS, clusterModules } from './foundationsRooms.js';

function buildIndex() {
  const items = [];
  for (const room of FOUNDATION_ROOMS) {
    items.push({ type: 'room', id: room.id, title: room.title, roomId: room.id, roomTitle: room.title });
    for (const cluster of room.clusters) {
      const mods = clusterModules(room.id, cluster.id, cluster.modules);
      for (const mod of mods) {
        items.push({ type: 'module', id: mod.id, title: mod.title, roomId: room.id, roomTitle: room.title });
      }
    }
  }
  return items;
}

export const SEARCH_INDEX = buildIndex();
