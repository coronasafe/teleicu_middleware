import type { Request } from "express";
import morgan from "morgan";

import type { WebSocket } from "@/types/ws";
import { eventType } from "@/utils/eventTypeConstant";
import { filterClients } from "@/utils/wsUtils";

export const morganWithWs = morgan(function (tokens, req: Request, res) {
  const data = {
    time: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res) || 500,
    responseTime: (tokens["response-time"](req, res) || "---") + " ms",
  };

  const server = req.wsInstance.getWss("/logger");
  filterClients(server, "/logger", true).forEach((client: WebSocket) => {
    console.log("client", client?.user?.id);
    client.send(JSON.stringify({ type: eventType.Request, ...data }));
  });

  return Object.values(data).join(" ");
});
