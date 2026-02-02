import type { Route } from "./Route";

export type GuardResult = boolean | { redirect: string };

export type Guard = (route: Route, fullPath: string) => Promise<GuardResult>;

