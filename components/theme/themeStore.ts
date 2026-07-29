type Listener = () => void;

let listeners: Listener[] = [];

const themeStore = {
  get(): string {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.dataset.theme ?? "dark";
  },

  set(value: string): void {
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("dra-theme", value);
    } catch {}
    listeners.forEach((l) => l());
  },

  subscribe(listener: Listener): () => void {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

export default themeStore;
