import React from 'react';
import BadgeIcon from "./icons/BadgeIcon";
import { Button, Icon, Tooltip } from "@chakra-ui/react";

const HackathonWinner = ({ message }) => {
  if (!message) return;

  return (
    <Tooltip label={message}>
      <Button variant="outline" size="sm">
        <Icon as={BadgeIcon} w={6} h={6} mr={2} />
      </Button>
    </Tooltip>
  )
}

export default HackathonWinner;