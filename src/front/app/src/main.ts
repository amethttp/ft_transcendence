import { Context } from "./framework/Context/Context";
import { Router } from "./framework/Router/Router";
import { TitleHelper } from "./framework/TitleHelper/TitleHelper";
import { ProgressBar } from "./framework/ProgressBar/ProgressBar";
import { routes } from "./routes";

const router = new Router("app", routes);
Context.router = router;

const progressBar = new ProgressBar();
let isInitialLoad = true;

router.on("navigate", (e) => { TitleHelper.setTitleFromRouteTree(e.routeTree) });
router.on("navigationStart", () => {
  if (!isInitialLoad) {
    progressBar.start();
  }
});

router.on("navigationEnd", (e) => {
  if (!isInitialLoad) {
    if (e.success) {
      progressBar.complete();
    } else {
      progressBar.fail();
    }
  }
  isInitialLoad = false;
});
