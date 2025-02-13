import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
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
} from "@chakra-ui/react";
import { useTable, useSortBy, useRowSelect } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import WithdrawStatsSkeleton from "../../components/skeletons/WithdrawStatsSkeleton";
import axios from "axios";
import { PONDER_URL as ponderUrl } from "../../constants";
import DateWithTooltip from "../../components/DateWithTooltip";
import { eventDisplay } from "../../helpers/events";
import { AddressWithBlockExplorer } from "../../components";
import { formatEther } from "@ethersproject/units";

const CohortAddressCell = ({ name, url }) => (
  <Link href={url} isExternal fontWeight="700" color="teal.500">
    {name}
  </Link>
);

const LastWithdrawCell = ({ withdraws, chainId }) => {
  if (withdraws.length === 0) {
    return "-";
  }

  const lastEvent = withdraws[0];

  return (
    <>
      <DateWithTooltip mb={2} timestamp={lastEvent.timestamp * 1000} />
      <AddressWithBlockExplorer address={lastEvent.builder} chainId={chainId} w="10" fontSize="16" />
      <Text>withdrew Ξ {parseFloat(lastEvent.amount).toFixed(4)}</Text>
      <Text fontStyle="italic" mt={2} wordBreak="break-all" fontSize="xs">
        "{lastEvent.reason}"
      </Text>
      {eventDisplay(lastEvent)}
    </>
  );
};

const columns = [
  {
    Header: "Cohort",
    accessor: row => { return { name: row.name, url: row.url } },
    Cell: ({ value }) => <CohortAddressCell name={value.name} url={value.url} />,
  },
  {
    Header: "Stream",
    accessor: row => { return { address: row.address, chainId: row.chainId } },
    Cell: ({ value }) => (
      <AddressWithBlockExplorer address={value.address} chainId={value.chainId} w="10" fontSize="16" />
    ),
  },
  {
    Header: "Balance",
    accessor: "balance",
    // Balance rounded to 4 decimals
    Cell: ({ value }) => <>Ξ {formatEther(BigInt(value) - (BigInt(value) % 100000000000000n))}</>,
  },
  {
    Header: "Nº builders",
    accessor: "builders",
    Cell: ({ value }) => <>{value.totalCount}</>,
  },
  {
    Header: "Nº of withdraws",
    accessor: "withdrawals.totalCount",
    Cell: ({ value }) => <>{value}</>,
  },
  {
    Header: "Last withdraw",
    accessor: row => { return { chainId: row.chainId, withdraws: row.withdrawals.items } },
    maxWidth: 150,
    Cell: ({ value }) => <LastWithdrawCell withdraws={value.withdraws} chainId={value.chainId} />,
  },
];

export default function Fund() {
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [cohortData, setCohortData] = useState([]);
  const { secondaryFontColor, baseColor } = useCustomColorModes();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCohorts(true);

      let query = `
        query {
          cohortInformations {
            items {
              address
              chainId
              name
              url
              balance
              builders(where: { amount_gt: 0 }) {
                totalCount
              }
              withdrawals(orderBy: "timestamp", orderDirection: "desc", limit: 1) {
                totalCount
                items {
                  id
                  builder
                  amount
                  reason
                  timestamp
                }
              }
            }
          }
        }
      `;

      let cohorts = [];
      try {
        const responsePonder = await axios.post(`${ponderUrl}`, { query });
        cohorts = responsePonder.data.data.cohortInformations.items;
        cohorts.sort((a, b) => (a.withdrawals.items.length > 0 ? a.withdrawals.items[0].timestamp : 0) - (b.withdrawals.items.length > 0 ? b.withdrawals.items[0].timestamp : 0))
        setCohortData(cohorts);
      } catch (error) {
        console.error(error);
        throw new Error(`Couldn't get the cohorts information from Ponder`);
      }

      setIsLoadingCohorts(false);
    };

    fetchData();
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
  } = useTable(
    {
      columns,
      data: cohortData,
      initialState: {
        sortBy: useMemo(() => [{ id: "withdraws", desc: true }], []),
      },
    },
    useSortBy,
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
      {isLoadingCohorts ? (
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
              {rows.map(row => {
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
        </Box>
      )}
    </Container>
  );
}
