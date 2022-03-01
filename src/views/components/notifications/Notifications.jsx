/* eslint-disable no-case-declarations */
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  HandIcon,
  PersonIcon,
  ConnectivityIcon,
  PoorConnectivityIcon,
} from "@100mslive/react-icons";
import {
  useHMSNotifications,
  HMSNotificationTypes,
} from "@100mslive/react-sdk";
import { Flex, Text, Button } from "@100mslive/react-ui";
import { HMSToastContainer, hmsToast } from "./hms-toast";
import { TrackUnmuteModal } from "./TrackUnmuteModal";
import { AutoplayBlockedModal } from "./AutoplayBlockedModal";
import { AppContext } from "../../../store/AppContext";
import { getMetadata } from "../../../common/utils";
import { InitErrorModal } from "./InitErrorModal";
import { TrackBulkUnmuteModal } from "./TrackBulkUnmuteModal";
import { useToast } from "../../new/Toast/useToast";

const TextWithIcon = ({ Icon, children }) => (
  <Flex>
    <Icon />
    <Text css={{ ml: "$4" }}>{children}</Text>
  </Flex>
);

export function Notifications() {
  const notification = useHMSNotifications();
  const history = useHistory();
  const { subscribedNotifications, isHeadless, HLS_VIEWER_ROLE } =
    useContext(AppContext);
  const { addToast } = useToast();
  useEffect(() => {
    if (!notification) {
      return;
    }
    switch (notification.type) {
      case HMSNotificationTypes.PEER_LIST:
        console.debug("[Peer List]", notification.data);
        if (!subscribedNotifications.PEER_JOINED) return;
        addToast({
          title: (
            <TextWithIcon Icon={PersonIcon}>
              {notification.data?.length} peers joined
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.PEER_JOINED:
        console.debug("[Peer Joined]", notification.data);
        if (!subscribedNotifications.PEER_JOINED) return;
        addToast({
          title: (
            <TextWithIcon Icon={PersonIcon}>
              {notification.data?.name} joined
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.METADATA_UPDATED:
        // Don't toast message when metadata is updated and raiseHand is false.
        // Don't toast message in case of local peer.
        const metadata = getMetadata(notification.data?.metadata);
        if (!metadata?.isHandRaised || notification.data.isLocal) return;

        console.debug("Metadata updated", notification.data);
        if (!subscribedNotifications.METADATA_UPDATED) return;
        addToast({
          title: (
            <TextWithIcon Icon={HandIcon}>
              {notification.data?.name} raised their hand.
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.NAME_UPDATED:
        console.log(
          notification.data.id +
            " changed their name to " +
            notification.data.name
        );
        break;
      case HMSNotificationTypes.PEER_LEFT:
        console.debug("[Peer Left]", notification.data);
        if (!subscribedNotifications.PEER_LEFT) return;
        addToast({
          title: (
            <TextWithIcon Icon={PersonIcon}>
              {notification.data?.name} left
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.NEW_MESSAGE:
        if (!subscribedNotifications.NEW_MESSAGE || notification.data?.ignored)
          return;
        addToast({
          title: `New message from ${notification.data?.senderName}`,
        });
        break;
      case HMSNotificationTypes.TRACK_ADDED:
        console.debug("[Track Added] data", notification.data);
        break;
      case HMSNotificationTypes.TRACK_REMOVED:
        console.debug("[Track Removed]", notification);
        break;
      case HMSNotificationTypes.TRACK_MUTED:
        console.log("[Track Muted]", notification);
        addToast({
          title: "Test",
          description: "kjefkwjefew fjkewnfkjnewfnew",
        });
        break;
      case HMSNotificationTypes.TRACK_UNMUTED:
        addToast({
          title: "Test",
          description: "kjefkwjefew fjkewnfkjnewfnew",
        });
        console.log("[Track Unmuted]", notification);
        break;
      case HMSNotificationTypes.ERROR:
        if (notification.data?.isTerminal) {
          if ([500, 6008].includes(notification.data?.code)) {
            addToast({
              title: `Error: ${notification.data?.message}`,
            });
          } else {
            // show button action when the error is terminal
            addToast({
              title: (
                <Flex justify="between">
                  <Text css={{ mr: "$4" }}>
                    {notification.data?.message ||
                      "We couldn’t reconnect you. When you’re back online, try joining the room."}
                  </Text>
                  <Button
                    variant="primary"
                    css={{ mr: "$4" }}
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Rejoin
                  </Button>
                </Flex>
              ),
              close: false,
            });
          }
          // goto leave for terminal if any action is not performed within 2secs
          // if network is still unavailable going to preview will throw an error
          setTimeout(() => {
            const previewLocation = history.location.pathname.replace(
              "meeting",
              "leave"
            );
            history.push(previewLocation);
          }, 2000);
          return;
        }
        if (notification.data?.code === 3008) {
          return;
        }
        if (notification.data?.action === "INIT") {
          return;
        }
        if (!subscribedNotifications.ERROR) return;
        addToast({
          title: `Error: ${notification.data?.message} - ${notification.data?.description}`,
        });
        break;
      case HMSNotificationTypes.RECONNECTED:
        addToast({
          title: (
            <TextWithIcon Icon={ConnectivityIcon}>
              You are now connected
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.RECONNECTING:
        addToast({
          title: (
            <TextWithIcon Icon={PoorConnectivityIcon}>
              You are offline for now. while we try to reconnect, please check
              your internet connection.
            </TextWithIcon>
          ),
        });
        break;
      case HMSNotificationTypes.ROLE_UPDATED:
        if (notification.data.roleName === HLS_VIEWER_ROLE) {
          return;
        }
        if (notification.data?.isLocal) {
          addToast({
            title: `You are now a ${notification.data.roleName}`,
          });
        }
        break;
      case HMSNotificationTypes.CHANGE_TRACK_STATE_REQUEST:
        const track = notification.data?.track;
        if (!notification.data.enabled) {
          addToast({
            title: `Your ${track.source} ${track.type} was muted by
                ${notification.data.requestedBy?.name}.`,
          });
        }
        break;
      case HMSNotificationTypes.REMOVED_FROM_ROOM:
      case HMSNotificationTypes.ROOM_ENDED:
        addToast({
          title: `${notification.message}. 
              ${
                notification.data.reason &&
                `Reason: ${notification.data.reason}`
              }`,
        });
        setTimeout(() => {
          const leaveLocation = history.location.pathname.replace(
            "meeting",
            "leave"
          );
          history.push(leaveLocation);
        }, 2000);
        break;
      case HMSNotificationTypes.DEVICE_CHANGE_UPDATE:
        hmsToast("", {
          left: <Text>{notification.message}.</Text>,
        });
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    history,
    notification,
    subscribedNotifications.ERROR,
    subscribedNotifications.NEW_MESSAGE,
    subscribedNotifications.PEER_JOINED,
    subscribedNotifications.PEER_LEFT,
    subscribedNotifications.METADATA_UPDATED,
    HLS_VIEWER_ROLE,
  ]);

  return (
    <>
      <HMSToastContainer />
      {!isHeadless && <TrackUnmuteModal />}
      {!isHeadless && <TrackBulkUnmuteModal />}
      <AutoplayBlockedModal />
      <InitErrorModal notification={notification} />
    </>
  );
}
