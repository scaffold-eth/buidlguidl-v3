import React, { useEffect, useState } from "react";
import { Box, Container, SkeletonText, Table, Thead, Tbody, Tr, Th } from "@chakra-ui/react";
import { getAllEvents } from "../data/api";
import EventRow from "../components/EventRow";

export default function ActivityView() {
  const [eventsFeed, setEventFeeds] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    const updateEvents = async () => {
      setIsLoadingEvents(true);
      const events = await getAllEvents(25);
      setEventFeeds(events);
      setIsLoadingEvents(false);
    };

    updateEvents();
  }, []);

  return (
    <Container maxW="container.md" centerContent>
      {isLoadingEvents ? (
        <Box w="100%" maxW="500px">
          <SkeletonText mt="4" noOfLines={10} spacing="4" />
        </Box>
      ) : (
        <Table>
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
        </Table>
      )}
    </Container>
  );
}
