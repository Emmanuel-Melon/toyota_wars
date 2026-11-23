// lib/missions/events/event-bus.ts
/**
 * Minimal typed event bus. Generic so it can move to lib/ later
 * and back combat, audio, etc. without change.
 */
export interface EventBus<E extends object> {
  on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): () => void;
  emit<K extends keyof E>(type: K, payload: E[K]): void;
}

export function createEventBus<E extends object>(): EventBus<E> {
  const handlers = new Map<keyof E, Set<(payload: never) => void>>();

  return {
    on(type, handler) {
      const set = handlers.get(type) ?? new Set();
      set.add(handler as (payload: never) => void);
      handlers.set(type, set);
      return () => set.delete(handler as (payload: never) => void);
    },
    emit(type, payload) {
      handlers
        .get(type)
        ?.forEach((h) => (h as (p: typeof payload) => void)(payload));
    },
  };
}
