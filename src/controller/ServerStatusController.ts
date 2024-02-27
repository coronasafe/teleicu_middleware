import type { Request, Response } from "express";
import expressWs from "express-ws";
import { loadavg } from "os";
import pidusage from "pidusage";

import type { WebSocket } from "@/types/ws";
import { eventType } from "@/utils/eventTypeConstant";
import { filterClients } from "@/utils/wsUtils";

export class ServerStatusController {
  static init(ws: expressWs.Instance) {
    const server = ws.getWss();
    let intervalId: NodeJS.Timeout | number | undefined = undefined;
    let clients: WebSocket[] = [];
    server.on("connection", () => {
      clients = filterClients(server, "/logger");
      if (!intervalId && clients.length !== 0) {
        intervalId = setInterval(() => {
          pidusage(process.pid, (err, stat) => {
            if (err) {
              console.log(err);
              return null;
            }

            if (!server.clients?.size) {
              clearInterval(intervalId);
              intervalId = undefined;
            }

            const data = {
              type: eventType.Resource,
              cpu: Number(stat.cpu).toFixed(2),
              memory: Number(stat.memory / 1024 / 1024).toFixed(2),
              uptime: stat.elapsed,
              load: loadavg()[0] || 0,
            };

            clients.forEach((client) => {
              client.send(JSON.stringify(data));
            });
          });
        }, 1000);
      }

      clients?.forEach((client) => {
        client.on("close", () => {
          clients = filterClients(server, "/logger");
        });
      });
    });
  }

  static render(req: Request, res: Response) {
    res.render("pages/serverStatus", { req });
  }
}
