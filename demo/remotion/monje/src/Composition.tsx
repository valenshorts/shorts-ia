import { Composition } from "remotion";
import { Monje } from "./Monje";
import { DATA } from "./data";

export const MyComposition = () => (
  <Composition id="Video" component={Monje} durationInFrames={Math.ceil(DATA.total * 30)} fps={30} width={1080} height={1920} />
);
