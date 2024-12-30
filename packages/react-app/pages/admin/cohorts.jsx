import React, { useEffect, useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { useTable, usePagination, useSortBy, useRowSelect } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import WithdrawStatsSkeleton from "../../components/skeletons/WithdrawStatsSkeleton";
import { getAllCohorts } from "../../data/api/builder";
import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";
import DateWithTooltip from "../../components/DateWithTooltip";
import { eventDisplay } from "../../helpers/events";
import { AddressWithBlockExplorer } from "../../components";

const CohortAddressCell = ({ cohort }) => (
  <Link href={cohort.url} isExternal fontWeight="700" color="teal.500">
    {cohort.name}
  </Link>
);

const LastWithdrawCell = ({ withdraws }) => {
  const lastEvent = withdraws.sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!lastEvent) {
    return "-";
  }

  return (
    <>
      <DateWithTooltip mb={2} timestamp={lastEvent.timestamp} />
      {eventDisplay(lastEvent)}
    </>
  );
};

const columns = [
  {
    Header: "Cohort",
    accessor: "cohort",
    Cell: ({ value }) => <CohortAddressCell cohort={value} />,
  },
  {
    Header: "Stream",
    accessor: "stream",
    Cell: ({ value }) => (
      <AddressWithBlockExplorer address={value.address} chainId={value.chainId} w="10" fontSize="16" />
    ),
  },
  {
    Header: "Balance",
    accessor: "balance",
    // Sorting by stream cap for now.
    Cell: ({ value }) => <>Ξ {parseFloat(value).toFixed(4)}</>,
  },
  {
    Header: "Nº builders",
    accessor: "builders",
    Cell: ({ value }) => <>{Object.keys(value).length}</>,
  },
  {
    Header: "Nº of withdraws",
    accessor: "withdrawsTotal",
    Cell: ({ value }) => <>{value}</>,
  },
  {
    Header: "Last withdraw",
    accessor: "withdraws",
    maxWidth: 150,
    Cell: ({ value }) => <LastWithdrawCell withdraws={value} />,
  },
];

export default function Fund() {
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [cohortData, setCohortData] = useState([]);
  const { secondaryFontColor, baseColor } = useCustomColorModes();

  const isLoading = isLoadingEvents || isLoadingCohorts;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCohorts(true);
      const cohorts = await getAllCohorts();

      let events = [];
      try {
        const response = await axios.get(`${serverUrl}/latest-events?type=cohort.withdraw`);
        events = response.data;
      } catch (error) {
        console.error(error);
        throw new Error(`Couldn't get the cohort withdraw events from the server`);
      }

      const groupedByStreamAddress = events.reduce((acc, event) => {
        const address = event.payload.streamAddress;

        if (!acc[address]) {
          acc[address] = [];
        }

        acc[address].push(event);

        return acc;
      }, {});


      const computedCohorts = cohorts.filter(cohort => !!cohort.balance).map(cohort => {
        return {
          cohort: {
            name: cohort.name,
            url: cohort.url,
          },
          stream: {
            address: cohort.id,
            chainId: cohort.chainId,
          },
          withdrawsTotal: groupedByStreamAddress[cohort.id]?.length,
          withdraws: groupedByStreamAddress[cohort.id] ?? [],
          ...cohort,
        };
      });

      setCohortData(computedCohorts);
      setIsLoadingCohorts(false);
    };

    fetchData();
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
      data: cohortData,
      initialState: { pageIndex: 0, pageSize: 100, sortBy: useMemo(() => [{ id: "balance", desc: false }], []) },
    },
    useSortBy,
    usePagination,
    useRowSelect,
  );

  return (
    <Container maxW="container.xl">
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          Cohorts
        </Heading>
        <Text color={secondaryFontColor} mb="10" textAlign="center">
          Active Cohorts
        </Text>
      </Container>
      {isLoading ? (
        <WithdrawStatsSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total Cohorts:</chakra.strong> {cohortData.length}
          </Center>
          <Table {...getTableProps()} background={baseColor} colorScheme="customBaseColorScheme" size="sm">
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
