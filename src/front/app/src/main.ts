import { Context } from "./framework/Context/Context";
import { Router } from "./framework/Router/Router";
import { TitleHelper } from "./framework/TitleHelper/TitleHelper";
import { routes } from "./routes";

const router = new Router("app", routes);
Context.router = router;

router.on("navigate", (e) => { TitleHelper.setTitleFromRouteTree(e.routeTree) });
