export interface AmethComponent {
  init: () => void;
  destroy?: () => Promise<void>;
  template?: () => Promise<typeof import("*.html?raw")>;
  viewInit?: () => void;
}
