import React from "react";
import { Link as RouteLink } from "react-router-dom";
import { Box, Button, Center, HStack, Image, Link, Td, Text, Tr } from "@chakra-ui/react";
import Address from "./Address";
import DateWithTooltip from "./DateWithTooltip";

export default function BuildReviewRow({ build, isLoading, featuredClick, notFeaturedClick }) {
  return (
    <Tr>
      <Td>
        <Link as={RouteLink} to={`/builders/${build.address}`} pos="relative">
          <Address address={build.builder} w="12.5" fontSize="16" />
        </Link>
      </Td>
      <Td>
        <HStack>
          <Box>
            <Text fontWeight="bold">{build.name}</Text>
            <Text>{build.desc}</Text>
            <Text mt={2}>
              <Link href={build.branch} color="teal.500" target="_blank" rel="noopener noreferrer">
                Link
              </Link>
            </Text>
          </Box>
          <Box>
            {build.image ? <Image src={build.image} h="100px" mx="auto" /> : <Center h="200px">No image</Center>}
          </Box>
        </HStack>
      </Td>
      <Td>
        <DateWithTooltip timestamp={build.submittedTimestamp} />
      </Td>
      <Td>
        {build.featured ? (
          <Button
            type="button"
            colorScheme="red"
            disabled={isLoading}
            className="danger"
            onClick={() => notFeaturedClick(build.builder, build.id)}
            size="xs"
          >
            Unfeature
          </Button>
        ) : (
          <Button
            type="button"
            colorScheme="green"
            disabled={isLoading}
            style={{ marginRight: 10 }}
            onClick={() => featuredClick(build.builder, build.id)}
            size="xs"
          >
            Feature
          </Button>
        )}
      </Td>
    </Tr>
  );
}
