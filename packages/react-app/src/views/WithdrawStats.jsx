import React, { useEffect, useState, useMemo } from "react";
import { Link as RouteLink } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Heading,
  Link,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Select,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTable, usePagination, useSortBy } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuildsVoteListSkeleton from "../components/skeletons/BuildsVoteListSkeleton";
import DateWithTooltip from "../components/DateWithTooltip";
import Address from "../components/Address";
import { getWithdrawEvents } from "../data/api/streams";
import { eventDisplay } from "../helpers/events";

const BuilderAddressCell = ({ builderId }) => {
  return (
    <Link as={RouteLink} to={`/builders/${builderId}`} pos="relative">
      <Address address={builderId} w="12.5" fontSize="16" />
    </Link>
  );
};

const columns = [
  {
    Header: "Builder",
    accessor: "builder",
    disableSortBy: true,
    Cell: ({ value }) => <BuilderAddressCell builderId={value} />,
  },
  {
    Header: "Total withdrawn",
    accessor: "total",
    disableSortBy: true,
    Cell: ({ value }) => <Box>{parseFloat(ethers.utils.formatEther(value)).toFixed(4)}</Box>,
  },
  {
    Header: "Last 30",
    accessor: "last30",
    disableSortBy: true,
    Cell: ({ value }) => <Box>{parseFloat(ethers.utils.formatEther(value)).toFixed(4)}</Box>,
  },
  {
    Header: "Last withdraw",
    accessor: "lastEvent",
    disableSortBy: true,
    Cell: ({ value }) => <Box>{eventDisplay(value)}</Box>,
  },
];

const milisIn30Days = 30 * 24 * 60 * 60 * 1000;
export default function WithdrawStats() {
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { secondaryFontColor } = useCustomColorModes();
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    const fetchWithdrawEvents = async () => {
      setIsLoadingEvents(true);
      let fetchedEvents;
      try {
        fetchedEvents = await getWithdrawEvents();
      } catch (error) {
        toast({
          description: "There was an error getting the events. Please try again",
          status: "error",
          variant: toastVariant,
        });
        setIsLoadingEvents(false);
        return;
      }
      const eventsByBuilder = {};
      fetchedEvents.forEach(event => {
        const builderAddress = event.payload.userAddress;
        if (!eventsByBuilder.hasOwnProperty(builderAddress)) {
          eventsByBuilder[builderAddress] = {
            builder: builderAddress,
            total: ethers.BigNumber.from(0),
            last30: ethers.BigNumber.from(0),
            lastEvent: { timestamp: 0 },
          };
        }
        const amount = ethers.utils.parseUnits(event.payload.amount);
        eventsByBuilder[builderAddress].total = eventsByBuilder[builderAddress].total.add(amount);
        const isWithin30Days = new Date().getTime() - event.timestamp < milisIn30Days;
        if (isWithin30Days) {
          eventsByBuilder[builderAddress].last30 = eventsByBuilder[builderAddress].last30.add(amount);
        }
        if (eventsByBuilder[builderAddress].lastEvent.timestamp < event.timestamp) {
          eventsByBuilder[builderAddress].lastEvent = event;
        }
      });
      setEvents(Object.values(eventsByBuilder));
      console.log(eventsByBuilder);
      setIsLoadingEvents(false);
    };

    fetchWithdrawEvents();
    // eslint-disable-next-line
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: events,
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "likes", desc: true }], []) },
    },
    useSortBy,
    usePagination,
  );

  return (
    <Container maxW="container.lg">
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          Withdraw Stats
        </Heading>
        <Text color={secondaryFontColor} mb="10" textAlign="center">
          These are all the builders that have withdrawn funds from their streams
        </Text>
      </Container>
      {isLoadingEvents ? (
        <BuildsVoteListSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total builds:</chakra.strong> {events.length}
          </Center>
          <Table {...getTableProps()}>
            <Thead>
              {headerGroups.map(headerGroup => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render("Header")}
                      <chakra.span pl="4">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <TriangleDownIcon aria-label="sorted descending" />
                          ) : (
                            <TriangleUpIcon aria-label="sorted ascending" />
                          )
                        ) : null}
                      </chakra.span>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          <Center mt={4}>
            <ButtonGroup>
              <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {"<<"}
              </Button>
              <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                {"<"}
              </Button>
              <Button onClick={() => nextPage()} disabled={!canNextPage}>
                {">"}
              </Button>
              <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {">>"}
              </Button>
            </ButtonGroup>
          </Center>
          <Center mt={4}>
            <Text mr={4}>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{" "}
            </Text>
            <Box>
              <Select
                isFullWidth={false}
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                }}
              >
                {[25, 50, 100].map(pageSizeOption => (
                  <option key={pageSizeOption} value={pageSizeOption}>
                    Show {pageSizeOption}
                  </option>
                ))}
              </Select>
            </Box>
          </Center>
        </Box>
      )}
    </Container>
  );
}
