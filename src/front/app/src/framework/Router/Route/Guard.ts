import type Path from "../Path/Path";

export type GuardResult = boolean | { redirect: string };

export type Guard = (path: Path) => Promise<GuardResult>;

