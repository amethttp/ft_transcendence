import type { Resolver } from "./Resolver";

export type Module = {
  default: any;
};

export type Route = {
  path: string;
  component?: () => Promise<Module>;
  resolver?: Resolver;
  redirect?: string;
  children?: Route[];
  title?: string;
};
