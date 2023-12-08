import React, { useEffect, useState, useMemo, forwardRef, useRef } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Flex,
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
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import DateWithTooltip from "../../components/DateWithTooltip";
import Address from "../../components/Address";
import FundBuilders from "../../components/FundBuilders";
import { getWithdrawEvents } from "../../data/api/streams";
import { eventDisplay } from "../../helpers/events";
import { byBigNumber, byTimestamp } from "../../helpers/sorting";
import WithdrawStatsSkeleton from "../../components/skeletons/WithdrawStatsSkeleton";
import { getAllBuilders } from "../../data/api/builder";
import StreamTableCell from "../../components/StreamTableCell";
import StreamRunway from "../../components/StreamRunway";

const BuilderAddressCell = ({ builder }) => {
  return (
    <NextLink href={`/builders/${builder.address}`} passHref>
      <Link pos="relative" isExternal>
        <Address address={builder.address} w="12.5" fontSize="16" cachedEns={builder.ens} />
      </Link>
    </NextLink>
  );
};

// eslint-disable-next-line react/display-name
const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});

const columns = [
  {
    Header: "Builder",
    accessor: "builder",
    disableSortBy: true,
    Cell: ({ value }) => <BuilderAddressCell builder={value} />,
  },
  {
    Header: "Stream",
    accessor: "stream",
    // Sorting by stream cap for now.
    sortType: (rowA, rowB) => {
      const balanceA = parseFloat(rowA.values?.stream?.stream?.balance);
      const balanceB = parseFloat(rowB.values?.stream?.stream?.balance);
      const capA = parseFloat(rowA.values?.stream?.stream?.cap);
      const capB = parseFloat(rowB.values?.stream?.stream?.cap);
      const lastA = parseFloat(rowA.values?.stream?.stream?.lastContract);
      const lastB = parseFloat(rowB.values?.stream?.stream?.lastContract);
      const frequencyA = parseFloat(rowA.values?.stream?.stream?.frequency);
      const frequencyB = parseFloat(rowB.values?.stream?.stream?.frequency);
      const unlockedAmountA = (capA * Math.round(new Date().getTime() / 1000 - lastA)) / frequencyA;
      const unlockedAmountB = (capB * Math.round(new Date().getTime() / 1000 - lastB)) / frequencyB;

      const availableA = capA < unlockedAmountA ? capA : unlockedAmountA;
      const availableB = capB < unlockedAmountB ? capB : unlockedAmountB;

      const gapA = balanceA / availableA;
      const gapB = balanceB / availableB;
      return gapA < gapB ? -1 : 1;
    },
    Cell: ({ value }) => (
      <Box>
        <StreamRunway stream={value?.stream} />
        <StreamTableCell builder={value} />
      </Box>
    ),
  },
  {
    Header: "Total withdrawn",
    accessor: "total",
    sortType: (rowA, rowB) => {
      const totalA = rowA.values?.total ?? ethers.BigNumber.from(0);
      const totalB = rowB.values?.total ?? ethers.BigNumber.from(0);
      return byBigNumber(totalA, totalB);
    },
    Cell: ({ value }) => <Box>{parseFloat(ethers.utils.formatEther(value)).toFixed(4)}</Box>,
  },
  {
    Header: () => <Box whiteSpace="nowrap">Last 30d</Box>,
    accessor: "last30",
    sortType: (rowA, rowB) => {
      const last30A = rowA.values?.last30 ?? ethers.BigNumber.from(0);
      const last30B = rowB.values?.last30 ?? ethers.BigNumber.from(0);
      return byBigNumber(last30A, last30B);
    },
    Cell: ({ value }) => <Box>{parseFloat(ethers.utils.formatEther(value)).toFixed(4)}</Box>,
  },
  {
    Header: "Last withdraw",
    accessor: "lastEvent",
    sortDescFirst: true,
    minWidth: 350,
    sortType: (rowA, rowB) => {
      const timeA = rowA.values?.lastEvent ?? { timestamp: 0 };
      const timeB = rowB.values?.lastEvent ?? { timestamp: 0 };
      return byTimestamp(timeA, timeB);
    },
    Cell: ({ value }) => (
      <Box>
        {!value ? (
          "-"
        ) : (
          <>
            <DateWithTooltip mb={2} timestamp={value.timestamp} />
            {eventDisplay(value)}
          </>
        )}
      </Box>
    ),
  },
];

const milisIn30Days = 30 * 24 * 60 * 60 * 1000;

export default function Fund() {
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [buildersWithStream, setBuildersWithStream] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);
  const [builderData, setBuilderData] = useState([]);
  const { secondaryFontColor } = useCustomColorModes();
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const isLoading = isLoadingEvents || isLoadingBuilders;

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
      setEvents(Object.values(fetchedEvents));
      setIsLoadingEvents(false);
    };

    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await getAllBuilders();

      const processedBuilders = fetchedBuilders
        .filter(({ stream }) => stream?.streamAddress)
        .filter(builder => !builder?.graduated?.status)
        .map(builder => ({
          builder: builder.id,
          ens: builder.ens,
          stream: builder.stream,
          builderData: builder,
        }));

      setBuildersWithStream(processedBuilders);
      setIsLoadingBuilders(false);
    }

    fetchWithdrawEvents();
    fetchBuilders();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (buildersWithStream.length === 0 || events.length === 0) {
      return;
    }

    const builderStreamDict = {};

    Object.values(buildersWithStream).forEach(({ builder, builderData, ens }) => {
      builderStreamDict[builder] = {
        builder: { address: builder, ens },
        stream: builderData,
        total: ethers.BigNumber.from(0),
        last30: ethers.BigNumber.from(0),
        lastEvent: null,
      };
    });

    events.forEach(event => {
      const builderAddress = event.payload.userAddress;
      if (!builderStreamDict.hasOwnProperty(builderAddress)) {
        // info: All events should be from registered builders. Skip unregistered builders.
        console.warn(`Found event from a registered builder. This shouldn't happen`);
        return;
      }
      const amount = ethers.utils.parseUnits(event.payload.amount);
      const isWithin30Days = new Date().getTime() - event.timestamp < milisIn30Days;
      builderStreamDict[builderAddress].total = builderStreamDict[builderAddress].total.add(amount);
      if (isWithin30Days) {
        builderStreamDict[builderAddress].last30 = builderStreamDict[builderAddress].last30.add(amount);
      }
      if (
        !builderStreamDict[builderAddress].lastEvent ||
        builderStreamDict[builderAddress].lastEvent.timestamp < event.timestamp
      ) {
        builderStreamDict[builderAddress].lastEvent = event;
      }
    });

    setBuilderData(Object.values(builderStreamDict));
  }, [buildersWithStream, events]);

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
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data: builderData,
      initialState: { pageIndex: 0, pageSize: 100, sortBy: useMemo(() => [{ id: "lastEvent", desc: true }], []) },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    },
  );

  return (
    <Container maxW="container.xl">
      <FundBuilders builders={selectedFlatRows.map(rowData => rowData.values?.stream)} />
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          Fund
        </Heading>
        <Text color={secondaryFontColor} mb="10" textAlign="center">
          Fund builder streams
        </Text>
      </Container>
      {isLoading ? (
        <WithdrawStatsSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total builders with stream:</chakra.strong> {buildersWithStream.length}
          </Center>
          <Table {...getTableProps()}>
            <Thead>
              {headerGroups.map((headerGroup, index) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
                  {headerGroup.headers.map(column => (
                    <Th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                      <Flex>
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
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map(cell => (
                      <Td {...cell.getCellProps()} key={cell.column.id}>
                        <Box
                          {...cell.getCellProps({
                            style: {
                              minWidth: cell.column.minWidth ?? "auto",
                            },
                          })}
                        >
                          {cell.render("Cell")}
                        </Box>
                      </Td>
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
