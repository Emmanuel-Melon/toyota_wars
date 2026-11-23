import { Request } from "express";
import { multistream, pino } from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const streams: any[] = [];

try {
  const pinoPretty = require("pino-pretty");
  const prettyStream = pinoPretty({
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  });
  streams.push({ stream: prettyStream });
} catch (e) {
  console.error("Pino-pretty failed to load", e);
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    serializers: {
      req: (req: Request) => ({ method: req.method, url: req.url }),
    },
  },
  multistream(isDevelopment ? streams : [{ stream: process.stdout }]),
);
