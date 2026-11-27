export type RadioChannel = "command" | "ally";

export type RadioPriority = "routine" | "urgent";

export interface RadioMessage {
  id: string;
  channel: RadioChannel;
  callsign: string;
  title: string;
  body: string;
  priority: RadioPriority;
  receivedAt: number;
  ttlMs: number;
}

export type RadioTransmission = Omit<RadioMessage, "receivedAt" | "ttlMs"> & {
  ttlMs?: number;
};
