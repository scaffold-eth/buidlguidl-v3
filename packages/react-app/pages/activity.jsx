import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Container, SkeletonText, Table, Thead, Tbody, Tr, Th, Select, Flex, Center } from "@chakra-ui/react";
import { getAllEvents } from "../data/api";
import EventRow from "../components/EventRow";
import { EVENT_TYPES } from "../helpers/events";

const countEventValues = [25, 50, 100];

export default function ActivityView() {
  const [eventsFeed, setEventFeeds] = useState([]);
  const [eventCount, setEventCount] = useState(25);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const { filter, count } = router.query;
    if (!filter && !count) return;

    if (filter) {
      const isValidFilter = Object.entries(EVENT_TYPES).some(([id, value]) => value === filter);
      if (isValidFilter) {
        setEventTypeFilter(filter);
      } else {
        setEventTypeFilter("");
        history.push({ search: null });
      }
    }

    if (count) {
      if (countEventValues.includes(Number(count))) {
        setEventCount(Number(count));
      } else {
        setEventCount(25);
        history.push({ search: null });
      }
    }
    // URL Param loading, only want to run on init.
    // eslint-disable-next-line
  }, [router]);

  useEffect(() => {
    const { filter } = router.query;

    // Avoid the initial extra request when we have a filter.
    if (filter && !eventTypeFilter) return;

    const updateEvents = async () => {
      setIsLoadingEvents(true);
      const events = await getAllEvents(eventTypeFilter, eventCount);
      setEventFeeds(events);
      setIsLoadingEvents(false);
    };

    updateEvents();
  }, [eventCount, eventTypeFilter, router]);

  const addToSearch = (name, value) => {
    const existingSearch = router.query;
    const existingParams = new URLSearchParams(existingSearch);

    if (value) {
      existingParams.set(name, value);
    } else {
      existingParams.delete(name);
    }

    return existingParams.toString();
  };

  const handleFilterChange = e => {
    const filter = e.target.value;
    setEventTypeFilter(filter);
    router.push({ search: addToSearch("filter", filter) });
  };

  return (
    <Container maxW="container.lg" centerContent mb="50px">
      {isLoadingEvents ? (
        <Box w="100%" maxW="500px">
          <SkeletonText mt="4" noOfLines={10} spacing="4" />
        </Box>
      ) : (
        <>
          <Flex mb={4} justify="right">
            <Select placeholder="- All -" onChange={handleFilterChange} value={eventTypeFilter}>
              {Object.entries(EVENT_TYPES).map(([id, value]) => (
                <option value={value} key={value}>
                  {id}
                </option>
              ))}
            </Select>
          </Flex>
          <Box mb={6}>
            {eventsFeed.map(event => (
              <EventRow key={JSON.stringify(event.payload)} event={event} />
            ))}
          </Box>
          <Center mt={4}>
            <Box>
              <Select
                isFullWidth={false}
                value={eventCount}
                onChange={e => {
                  const count = Number(e.target.value);
                  setEventCount(count);
                  history.push({ search: addToSearch("count", count) });
                }}
              >
                {countEventValues.map(countOption => (
                  <option key={countOption} value={countOption}>
                    Show {countOption}
                  </option>
                ))}
              </Select>
            </Box>
          </Center>
        </>
      )}
    </Container>
  );
}
