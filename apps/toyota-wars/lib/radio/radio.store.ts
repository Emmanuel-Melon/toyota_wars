import type { RadioMessage, RadioTransmission } from "./radio.types";

const MAX_MESSAGES = 3;
const DEFAULT_TTL_MS = 8000;
const URGENT_TTL_MS = 12000;

let messages: readonly RadioMessage[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeRadio(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRadioSnapshot(): readonly RadioMessage[] {
  return messages;
}

function removeRadioMessage(id: string) {
  const next = messages.filter((message) => message.id !== id);
  if (next.length === messages.length) return;
  messages = next;
  notify();
}

export function transmitRadio(transmission: RadioTransmission) {
  if (messages.some((message) => message.id === transmission.id)) return;

  const ttlMs =
    transmission.ttlMs ??
    (transmission.priority === "urgent" ? URGENT_TTL_MS : DEFAULT_TTL_MS);
  const message: RadioMessage = {
    ...transmission,
    ttlMs,
    receivedAt: Date.now(),
  };

  messages = [message, ...messages].slice(0, MAX_MESSAGES);
  notify();
  setTimeout(() => removeRadioMessage(message.id), ttlMs);
}

export function resetRadio() {
  if (messages.length === 0) return;
  messages = [];
  notify();
}
