import type { Guard } from "./Guard";

export type Module = {
  default: any;
};

export type Route = {
  path: string;
  component?: () => Promise<Module>;
  guard?: Guard;
  redirect?: string;
  children?: Route[];
  title?: string;
};
