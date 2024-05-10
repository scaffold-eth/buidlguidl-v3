import React from "react";
import { Box, Button, Container, Heading } from "@chakra-ui/react";
import EventRow from "../../components/EventRow";
import NextLink from "next/link";

const ActivitySection = ({ events }) => {
  return (
    <Container maxW="container.lg" mb="50px">
      <Heading fontWeight="500" mb={8} mt={20}>
        Recent Activity
      </Heading>
      <Box mb={6}>
        {events.map(event => (
          <EventRow key={JSON.stringify(event.payload)} event={event} />
        ))}
      </Box>
      {/*Center*/}
      <Box textAlign="center" mt={12}>
        <NextLink href="activity" passHref>
          <Button as="a" href="/activity" variant="outline" colorScheme="customColorScheme" mx="auto" size="sm">
            View All
          </Button>
        </NextLink>
      </Box>
    </Container>
  );
};

export default ActivitySection;
