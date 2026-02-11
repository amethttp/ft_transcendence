import type Path from "../Path/Path";

export type ResolvedData = Record<string, any>;

/**
 * Resolver return values:
 * - `true` or `ResolvedData`: Success. ResolvedData is merged into contextData.
 * - `string`: Hard redirect. Navigation stops, router navigates to the string path.
 * - `false`: Cancelled. Navigation stops, URL reverts to previous valid state.
*/
export type ResolverResult = boolean | string | ResolvedData;

/**
 * Resolver function for route guards and data loading.
 * @param path - Resolved Path object with fullPath, routePath, and extracted params
 * @param parentData - Data accumulated from parent resolvers
 */
export type Resolver = (path: Path, parentData?: ResolvedData) => Promise<ResolverResult>;

