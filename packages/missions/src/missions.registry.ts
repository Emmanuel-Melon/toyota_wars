export type MissionsRegistry<TEntry> = {
  register: (id: string, entry: TEntry) => void;
  get: (id: string) => TEntry | undefined;
  require: (id: string) => TEntry;
  all: () => TEntry[];
  ids: () => string[];
  reset: () => void;
};

export function createMissionsRegistry<TEntry>(): MissionsRegistry<TEntry> {
  const entries = new Map<string, TEntry>();

  return {
    register(id, entry) {
      if (entries.has(id)) {
        console.warn(
          `[MissionsRegistry] Overwriting existing mission registration for id "${id}".`,
        );
      }
      entries.set(id, entry);
    },
    get(id) {
      return entries.get(id);
    },
    require(id) {
      const entry = entries.get(id);
      if (!entry) {
        throw new Error(
          `[MissionsRegistry] No mission registered with id "${id}". Ensure mission modules are imported during initialization.`,
        );
      }
      return entry;
    },
    all() {
      return Array.from(entries.values());
    },
    ids() {
      return Array.from(entries.keys());
    },
    reset() {
      entries.clear();
    },
  };
}
