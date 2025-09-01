import type { Router } from "../Router";
import type { Route } from "./Route";

export type Guard = (route: Route, router: Router) => Promise<boolean>;
