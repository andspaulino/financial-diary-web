declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.module.css";
declare module "*.module.scss";
declare module "*.module.sass";

// Allow importing SVGs as React components if you're using a loader for that
declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}
