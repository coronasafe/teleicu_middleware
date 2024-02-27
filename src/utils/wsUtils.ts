import type { Server } from "ws";

import type { WebSocket } from "@/types/ws";

export const filterClients = (ws: Server, path: string) => {
  // console.log("CLEINT", ws.clients)
  return Array.from(ws?.clients || []).filter(
    (client: WebSocket) => client.route === path,
  );
};
