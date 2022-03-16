import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  SkeletonText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Select,
  Flex,
  TableCaption,
} from "@chakra-ui/react";
import { getAllEvents } from "../data/api";
import EventRow from "../components/EventRow";
import { EVENT_TYPES } from "../helpers/events";

export default function ActivityView() {
  const [eventsFeed, setEventFeeds] = useState([]);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    const updateEvents = async () => {
      setIsLoadingEvents(true);
      const events = await getAllEvents(eventTypeFilter, 25);
      setEventFeeds(events);
      setIsLoadingEvents(false);
    };

    updateEvents();
  }, [eventTypeFilter]);

  return (
    <Container maxW="container.md" centerContent>
      {isLoadingEvents ? (
        <Box w="100%" maxW="500px">
          <SkeletonText mt="4" noOfLines={10} spacing="4" />
        </Box>
      ) : (
        <>
          <Flex mb={4} justify="right">
            <Select placeholder="- All -" onChange={e => setEventTypeFilter(e.target.value)} value={eventTypeFilter}>
              {Object.entries(EVENT_TYPES).map(([id, value]) => (
                <option value={value} key={value}>
                  {id}
                </option>
              ))}
            </Select>
          </Flex>
          <Table mb={6}>
            <Thead>
              <Tr>
                <Th>Builder</Th>
                <Th>Time</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {eventsFeed.map(event => (
                <EventRow key={`${event.timestamp}_${event.payload.userAddress}`} event={event} />
              ))}
            </Tbody>
            <TableCaption>Showing latest 25 events</TableCaption>
          </Table>
        </>
      )}
    </Container>
  );
}
