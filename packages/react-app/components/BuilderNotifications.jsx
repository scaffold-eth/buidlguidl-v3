import { Alert, AlertIcon, Box, CloseButton, Heading, Tooltip, VStack } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { chakraMarkdownComponents } from "../helpers/chakraMarkdownTheme";
import ReactMarkdown from "react-markdown";
import { useNotifications } from "../contexts/notificationContext";
import OnboardingBatch from "./notifications/OnboardingBatch";

const notificationComponents = {
  OnboardingBatch: OnboardingBatch,
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  if (notification.component && notificationComponents[notification.component]) {
    const Component = notificationComponents[notification.component];
    return <Component notification={notification} onMarkAsRead={onMarkAsRead} />;
  }

  return (
    <Alert status="warning" position="relative">
      <AlertIcon />
      <Box>
        <Heading size="md" marginBottom="2">
          {notification.title}
        </Heading>
        <ReactMarkdown components={ChakraUIRenderer(chakraMarkdownComponents)}>{notification.content}</ReactMarkdown>
        <Tooltip label="Mark as Read" aria-label="Mark as Read">
          <CloseButton position="absolute" right="4px" top="4px" onClick={() => onMarkAsRead(notification.id)} />
        </Tooltip>
      </Box>
    </Alert>
  );
};

const BuilderNotifications = () => {
  const { notifications, markNotificationAsRead } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <VStack align="stretch" spacing="4" mb="4">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markNotificationAsRead} />
      ))}
    </VStack>
  );
};

export default BuilderNotifications;
