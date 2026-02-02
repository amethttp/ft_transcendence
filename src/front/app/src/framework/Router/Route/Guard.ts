import type { Router } from "../Router";
import type { Route } from "./Route";

export type GuardResult = boolean | { redirect: string };

export type Guard = (route: Route, router: Router) => Promise<GuardResult>;

