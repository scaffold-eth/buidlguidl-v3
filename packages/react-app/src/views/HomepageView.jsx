import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
import EventRow from "../components/EventRow";
import { EVENT_TYPES } from "../helpers/events";

export default function HomepageView() {
  return (
    <Container maxW="container.md" centerContent>
      Homepage
    </Container>
  );
}
