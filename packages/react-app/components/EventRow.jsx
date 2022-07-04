import React from "react";
import { Link as RouteLink } from "react-router-dom";
import { Tr, Td, Link } from "@chakra-ui/react";
import Address from "./Address";
import { eventDisplay } from "../helpers/events";
import DateWithTooltip from "./DateWithTooltip";

const fundersAddresses = ["0xef6784161dc2eAB0A2c385DEf264DaF2F52Df970", "0x60775dCC868EcE33B6AC45A1Dd5D448aea3B7a71"];
const buidlGuidlAddress = "0x97843608a00e2bbc75ab0c1911387e002565dede";

const EventRow = ({ event }) => {
  let userAddress = event.payload.userAddress;

  if (fundersAddresses.includes(userAddress)) {
    // We always want to show the BuidlGuidl address as the funder account.
    userAddress = buidlGuidlAddress;
  }

  return (
    <Tr>
      <Td>
        <Link as={RouteLink} to={`/builders/${userAddress}`} pos="relative">
          <Address address={userAddress} w="12.5" fontSize="16" />
        </Link>
      </Td>
      <Td whiteSpace="nowrap">
        <DateWithTooltip timestamp={event.timestamp} />
      </Td>
      <Td>{eventDisplay(event)}</Td>
    </Tr>
  );
};

export default EventRow;
