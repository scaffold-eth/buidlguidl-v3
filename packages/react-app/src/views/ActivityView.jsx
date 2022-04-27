import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Box, Container, SkeletonText, Table, Thead, Tbody, Tr, Th, Select, Flex, Center } from "@chakra-ui/react";
import { getAllEvents } from "../data/api";
import EventRow from "../components/EventRow";
import { EVENT_TYPES } from "../helpers/events";
import useQuery from "../hooks/useQuery";

const countEventValues = [25, 50, 100];

export default function ActivityView() {
  const [eventsFeed, setEventFeeds] = useState([]);
  const [eventCount, setEventCount] = useState(25);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const history = useHistory();
  const query = useQuery();

  useEffect(() => {
    const filter = query.get("filter");
    const count = query.get("count");
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
  }, []);

  useEffect(() => {
    // Avoid the initial extra request when we have a filter.
    if (query.get("filter") && !eventTypeFilter) return;
    // if (query.get("count") && eventCount === 25) return;

    const updateEvents = async () => {
      setIsLoadingEvents(true);
      const events = await getAllEvents(eventTypeFilter, eventCount);
      setEventFeeds(events);
      setIsLoadingEvents(false);
    };

    updateEvents();
  }, [eventCount, eventTypeFilter, query]);

  const addToSearch = (name, value) => {
    const existingSearch = history.location.search;
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
    history.push({ search: addToSearch("filter", filter) });
  };

  return (
    <Container maxW="container.md" centerContent mb="50px">
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
                <EventRow key={JSON.stringify(event.payload)} event={event} />
              ))}
            </Tbody>
          </Table>
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
