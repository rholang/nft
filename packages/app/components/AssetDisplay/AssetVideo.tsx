import { Video } from "./AssetDisplay.styled";
import { IPFS_RESOLVER_VIDEO } from "../../utils/constants";

const AssetVideo = ({ video }: { video: string }): JSX.Element => (
  <Video
    controls
    loop
    autoPlay
    onLoadStart={() =>
      (document.getElementsByTagName("video")[0].volume = 0.15)
    }
    src={`${IPFS_RESOLVER_VIDEO}${video}`}
  />
);

export default AssetVideo;
