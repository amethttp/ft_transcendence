import type { Route } from "./Route";

export type Guard = (route: Route) => boolean;
