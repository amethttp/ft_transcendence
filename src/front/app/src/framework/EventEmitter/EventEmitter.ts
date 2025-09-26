type Listener<T = any> = (payload: T) => void;

export type AmethEvent = {
  message: string;
  data: { id: number; value: string };
};

export default class EventEmitter<Events extends Record<string, any> = AmethEvent> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners[event] = this.listeners[event]?.filter(l => l !== listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(listener => {
      Promise.resolve().then(() => listener(payload));
    });
  }

  emitSync<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(listener => {
      listener(payload);
    });
  }

  destroy() {
    this.listeners = {};
  }
}
