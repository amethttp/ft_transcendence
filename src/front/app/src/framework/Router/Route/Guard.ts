import type { Route } from "./Route";

export type Guard = (route: Route) => Promise<boolean>;
