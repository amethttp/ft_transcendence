export interface AmethComponent {
  template?: () => Promise<typeof import("*.html?raw")>;
  init: () => void;
  viewInit?: () => void;
  destroy?: () => Promise<void>;
  
}
