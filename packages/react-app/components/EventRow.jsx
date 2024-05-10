import React from "react";
import NextLink from "next/link";
import { Tr, Td, Link, Box, HStack, Flex } from "@chakra-ui/react";
import Address from "./Address";
import { eventDisplay } from "../helpers/events";
import DateWithTooltip from "./DateWithTooltip";
import useCustomColorModes from "../hooks/useCustomColorModes";

const fundersAddresses = ["0xef6784161dc2eAB0A2c385DEf264DaF2F52Df970", "0x60775dCC868EcE33B6AC45A1Dd5D448aea3B7a71"];
const buidlGuidlAddress = "0x97843608a00e2bbc75ab0c1911387e002565dede";

const EventRow = ({ event, bgColor }) => {
  let userAddress = event.payload.userAddress;

  if (fundersAddresses.includes(userAddress)) {
    // We always want to show the BuidlGuidl address as the funder account.
    userAddress = buidlGuidlAddress;
  }

  const { baseColor } = useCustomColorModes();
  const [eventTitle, eventDescription] = eventDisplay(event);

  return (
    <Box backgroundColor={bgColor ?? baseColor} mb={4} px={8} py={6}>
      <HStack spacing={8} align="flex-start" justify="space-between">
        <HStack spacing={2.5} align="flex-start">
          <NextLink href={`/builders/${userAddress}`} passHref>
            <Link pos="relative" mt="-5.5px">
              <Address address={userAddress} w="8" fontSize={14} />
            </Link>
          </NextLink>
          <Box fontSize="sm">{eventTitle}</Box>
        </HStack>
        <Box whiteSpace="nowrap" fontSize="sm">
          <DateWithTooltip timestamp={event.timestamp} />
        </Box>
      </HStack>
      {eventDescription && (
        <Box fontSize="sm" mt={4}>
          {eventDescription}
        </Box>
      )}
    </Box>
  );
};

export default EventRow;
