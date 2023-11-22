import { Box, CloseButton, Heading, Tooltip, VStack } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { chakraMarkdownComponents } from "../helpers/chakraMarkdownTheme";
import ReactMarkdown from "react-markdown";
import { useNotifications } from "../contexts/notificationContext";
import OnboardingBatch from "./notifications/OnboardingBatch";
import { useEffect } from "react";
import { usePlausible } from "next-plausible";

const notificationComponents = {
  OnboardingBatch: OnboardingBatch,
};

const NotificationItem = ({ notification, onMarkAsRead, builder }) => {
  const plausible = usePlausible();

  useEffect(() => {
    if (builder.role === "admin") return;
    plausible("NotificationViewed", {
      props: {
        id: notification.id,
        title: notification.title,
        builderAddress: builder.id,
      },
    });
  }, [notification]);

  if (notification.component && notificationComponents[notification.component]) {
    const Component = notificationComponents[notification.component];
    return <Component notification={notification} onMarkAsRead={onMarkAsRead} />;
  }

  return (
    <Box p={6} position="relative" backgroundColor="blue.100">
      <Box>
        <Heading size="md" marginBottom="2">
          {notification.title}
        </Heading>
        <ReactMarkdown components={ChakraUIRenderer(chakraMarkdownComponents)}>{notification.content}</ReactMarkdown>
        <Tooltip label="Mark as Read" aria-label="Mark as Read">
          <CloseButton position="absolute" right="4px" top="4px" onClick={() => onMarkAsRead(notification.id)} />
        </Tooltip>
      </Box>
    </Box>
  );
};

const BuilderNotifications = ({ builder }) => {
  const { notifications, markNotificationAsRead } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <VStack align="stretch" spacing="4" mb="4">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markNotificationAsRead}
          builder={builder}
        />
      ))}
    </VStack>
  );
};

export default BuilderNotifications;
