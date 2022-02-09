// @ts-check
import React, { useRef, useState } from "react";
import { StyledVideoTile, Video, VideoTileStats } from "@100mslive/react-ui";
import {
  useHMSStore,
  selectPeerByID,
  selectTrackByID,
  selectScreenShareAudioByPeerID,
} from "@100mslive/react-sdk";
import { ExpandIcon, ShrinkIcon } from "@100mslive/react-icons";
import { useFullscreen } from "react-use";
import { HmsTileMenu } from "../UIComponents";
import { getVideoTileLabel } from "./peerTileUtils";

const HmsScreenshareTile = ({
  trackId,
  showStatsOnTiles,
  width = "100%",
  height = "100%",
}) => {
  const track = useHMSStore(selectTrackByID(trackId));
  const peer = useHMSStore(selectPeerByID(track?.peerId));
  const [isMouseHovered, setIsMouseHovered] = useState(false);
  const label = getVideoTileLabel(peer, track);
  const fullscreenRef = useRef(null);
  // fullscreen is for desired state
  const [fullscreen, setFullscreen] = useState(false);
  // isFullscreen is for true state
  const isFullscreen = useFullscreen(fullscreenRef, fullscreen, {
    onClose: () => setFullscreen(false),
  });
  const audioTrack = useHMSStore(selectScreenShareAudioByPeerID(peer?.id));
  return (
    <StyledVideoTile.Root css={{ width, height }}>
      {peer ? (
        <StyledVideoTile.Container
          transparentBg
          ref={fullscreenRef}
          onMouseEnter={() => setIsMouseHovered(true)}
          onMouseLeave={() => {
            setIsMouseHovered(false);
          }}
        >
          {showStatsOnTiles ? (
            <VideoTileStats
              audioTrackID={audioTrack?.id}
              videoTrackID={track?.id}
            />
          ) : null}
          <StyledVideoTile.FullScreenButton
            onClick={() => setFullscreen(!fullscreen)}
          >
            {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
          </StyledVideoTile.FullScreenButton>
          {track ? (
            <Video
              screenShare={true}
              mirror={peer.isLocal && track?.source === "regular"}
              trackId={track.id}
            />
          ) : null}
          <StyledVideoTile.Info>{label}</StyledVideoTile.Info>
          {isMouseHovered && !peer?.isLocal ? (
            <HmsTileMenu
              isScreenshare
              peerID={peer?.id}
              audioTrackID={audioTrack?.id}
              videoTrackID={track?.id}
            />
          ) : null}
        </StyledVideoTile.Container>
      ) : null}
    </StyledVideoTile.Root>
  );
};

export default HmsScreenshareTile;
