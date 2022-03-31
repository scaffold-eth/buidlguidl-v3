import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link as RouteLink } from "react-router-dom";
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
import { useTable, usePagination, useSortBy } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";
import DateWithTooltip from "../components/DateWithTooltip";
import Address from "../components/Address";
import WithdrawStatsSkeleton from "../components/skeletons/WithdrawStatsSkeleton";
import { getEnsClaims } from "../data/api/ens";
import useSignedRequest from "../hooks/useSignedRequest";
import useConnectedAddress from "../hooks/useConnectedAddress";

const BuilderAddressCell = ({ builder, mainnetProvider }) => {
  return (
    <Link as={RouteLink} to={`/builders/${builder.id}`} pos="relative">
      <Address address={builder.id} ensProvider={mainnetProvider} w="12.5" fontSize="16" cachedEns={builder.ens} />
    </Link>
  );
};

export default function EnsClaimsView({ mainnetProvider }) {
  const address = useConnectedAddress();
  const [ensClaims, setEnsClaims] = useState([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const { isLoading, makeSignedRequest } = useSignedRequest("builderProvideEns", address);

  const { secondaryFontColor } = useCustomColorModes();
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const fetchEnsData = useCallback(async () => {
    const claims = await getEnsClaims();
    setIsLoadingClaims(true);

    const processedEnsClaims = claims.map(builder => ({
      builder,
      requested: builder.ensClaim?.submittedTimestamp,
    }));

    setEnsClaims(processedEnsClaims);
    setIsLoadingClaims(false);
  }, []);

  useEffect(() => {
    fetchEnsData();
  }, [fetchEnsData]);

  const markAsEnsProvided = async builderAddress => {
    try {
      await makeSignedRequest({ builderAddress });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      description: "Markes as ENS provided!",
      variant: toastVariant,
    });

    fetchEnsData();
  };

  const columns = useMemo(
    () => [
      {
        Header: "Builder",
        accessor: "builder",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderAddressCell builder={value} mainnetProvider={mainnetProvider} />,
      },
      {
        Header: "Requested",
        accessor: "requested",
        Cell: ({ value }) => (
          <Text whiteSpace="nowrap">
            <DateWithTooltip timestamp={value} />
          </Text>
        ),
      },
      {
        Header: "Mark as provided",
        accessor: "builder",
        id: "provide",
        Cell: ({ value: builder }) => (
          <Button
            type="button"
            colorScheme="green"
            disabled={isLoading}
            style={{ marginRight: 10 }}
            onClick={() => markAsEnsProvided(builder.id)}
            size="xs"
          >
            Mark as provided
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line
    [address],
  );

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
      data: ensClaims,
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "lastEvent", desc: true }], []) },
    },
    useSortBy,
    usePagination,
  );

  return (
    <Container maxW="container.md">
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          Withdraw Stats
        </Heading>
        <Text color={secondaryFontColor} mb="10" textAlign="center">
          ENS Claims
        </Text>
      </Container>
      {isLoadingClaims ? (
        <WithdrawStatsSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total builders requesting ENS:</chakra.strong> {ensClaims.length}
          </Center>
          <Table {...getTableProps()}>
            <Thead>
              {headerGroups.map(headerGroup => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
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
                  <Tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <Td {...cell.getCellProps()}>
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
