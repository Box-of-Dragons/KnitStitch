
// TODO(knitstitch): retired 3D bootstrap. Remove once the fork no longer needs
// the upstream CAD front as a reference or shared runtime entry point.
import startApplication from "./cad/init/startApplication";

startApplication(context => {
  window.__CAD_APP = context;
});
