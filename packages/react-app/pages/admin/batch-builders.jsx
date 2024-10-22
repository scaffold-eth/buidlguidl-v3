import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import NextLink from "next/link";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Link,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Flex,
  Select,
  Tooltip,
  HStack,
  Input,
  InputRightElement,
  InputGroup,
  useClipboard,
} from "@chakra-ui/react";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import { CopyIcon, SearchIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import BuilderListSkeleton from "../../components/skeletons/BuilderListSkeleton";
import DateWithTooltip from "../../components/DateWithTooltip";
import SocialLink from "../../components/SocialLink";
import Address from "../../components/Address";
import { bySocialWeight } from "../../data/socials";
import { USER_ROLES } from "../../helpers/constants";
import BuilderBatchNameCell from "../../components/batch-builders/BatchBuilderNameCell";
import BuilderFlags from "../../components/builder/BuilderFlags";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import BatchColumnFilter from "../../components/BatchColumnFilter";

const serverPath = "/builders/batches";

const builderCreated = builder => {
  return builder?.creationTimestamp || 0;
};

const BuilderSocialLinksCell = ({ builder, isAdmin }) => {
  const socials = Object.entries(builder.socialLinks ?? {}).sort(bySocialWeight);

  return (
    <Flex direction="column">
      <HStack spacing={3} alignItems="center" justifyContent="center">
        {socials.length ? (
          socials.map(([socialId, socialValue]) => <SocialLink id={socialId} key={socialId} value={socialValue} />)
        ) : (
          <Box>-</Box>
        )}
      </HStack>
      {isAdmin && <BuilderFlags builder={builder} />}
    </Flex>
  );
};

const BuilderAddressCell = ({ builder, mainnetProvider }) => {
  const { hasCopied, onCopy } = useClipboard(builder?.id);

  return (
    <Flex alignItems="center" whiteSpace="nowrap">
      <NextLink href={`/builders/${builder.id}`} passHref>
        <Link pos="relative" d="inline-block">
          <Address address={builder.id} ensProvider={mainnetProvider} w="12.5" fontSize="16" cachedEns={builder.ens} />
        </Link>
      </NextLink>
      <Tooltip label={hasCopied ? "Copied!" : "Copy address"} closeOnClick={false}>
        <CopyIcon cursor="pointer" onClick={onCopy} ml={"7px"} />
      </Tooltip>
    </Flex>
  );
};

const BuilderStatusCell = ({ status }) => {
  return (
    <Tooltip label={moment(status?.timestamp).fromNow()}>
      <Text maxW="350">{status?.text}</Text>
    </Tooltip>
  );
};

const BuilderBuildsCell = ({ buildCount }) => {
  return <Text>{buildCount}</Text>;
};

const EnsColumnFilter = ({ column: { filterValue, setFilter } }) => {
  const { baseColor } = useCustomColorModes();

  return (
    <Input
      type="text"
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      placeholder="Search builder"
      bgColor={baseColor}
      mb={8}
    />
  );
};

const isValueOnEnsOrSocials = (builder, filterValue) => {
  const isOnEns = String(builder.ens).toLowerCase().includes(String(filterValue).toLowerCase());
  const isOnSocials =
    builder.socialLinks &&
    Object.entries(builder.socialLinks ?? {}).some(([_, social]) => {
      return String(social).toLowerCase().includes(String(filterValue).toLowerCase());
    });

  return isOnEns || isOnSocials;
};

const isInBatch = (builder, filterValue) => {
  if (!builder.number) return false;
  return builder.number === filterValue;
};

export default function BatchBuilderListView({ serverUrl, mainnetProvider, userRole }) {
  const [builders, setBuilders] = useState([]);
  const [amountBuilders, setAmountBuilders] = useState(0);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);
  const isAdmin = userRole === USER_ROLES.admin;
  const isLoggedIn = userRole !== null && userRole !== USER_ROLES.anonymous;
  const { baseColor } = useCustomColorModes();

  const ensFiltering = (rows, id, filterValue) => {
    if (filterValue.length < 3) {
      return rows;
    }

    return rows.filter(row => {
      const rowValue = row.values[id];
      return rowValue !== undefined ? isValueOnEnsOrSocials(rowValue, filterValue) : true;
    });
  };

  const batchFiltering = (rows, id, filterValue) => {
    if (filterValue === "allBatches") {
      setAmountBuilders(rows.length);
      return rows;
    }

    const filteredRows = rows.filter(row => {
      const rowValue = row.values[id];
      return rowValue !== undefined ? isInBatch(rowValue, filterValue) : true;
    });

    setAmountBuilders(filteredRows.length);

    return filteredRows;
  };

  useEffect(() => {
    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await axios.get(serverUrl + serverPath);

      const processedBuilders = fetchedBuilders.data
        .filter(builder => builder.ens !== "austingriffith.eth")
        .map(builder => ({
          builder,
          status: builder.status,
          batch: builder.batch,
          builds: builder.builds?.length || 0,
          socials: builder,
          userCreated: builderCreated(builder),
        }));

      setBuilders(processedBuilders);
      setIsLoadingBuilders(false);
    }

    fetchBuilders();
  }, [serverUrl]);

  const BatchFilterComponent = useMemo(() => {
    const Component = ({ column }) => (
      <BatchColumnFilter filterValue={column.filterValue} setFilter={column.setFilter} builders={builders} />
    );
    Component.displayName = "BatchFilterComponent";
    return Component;
  }, [builders]);

  const BuilderAddressCellComponent = ({ value }) => (
    <BuilderAddressCell builder={value} mainnetProvider={mainnetProvider} />
  );
  const BuilderStatusCellComponent = ({ value }) => <BuilderStatusCell status={value} />;
  const BuilderBuildsCellComponent = ({ value }) => <BuilderBuildsCell buildCount={value} />;
  const BatchTableCellComponent = ({ value }) => {
    return <BuilderBatchNameCell batch={value} />;
  };
  const BuilderSocialLinksCellComponent = ({ value }) => <BuilderSocialLinksCell builder={value} isAdmin={isAdmin} />;
  const UserCreatedCellComponent = ({ value }) => {
    return <DateWithTooltip timestamp={value} />;
  };

  const columns = useMemo(
    () => {
      const allColumns = [
        {
          Header: "Builder",
          accessor: "builder",
          disableSortBy: true,
          canFilter: true,
          Filter: EnsColumnFilter,
          filter: ensFiltering,
          Cell: BuilderAddressCellComponent,
        },
        {
          Header: "Status",
          accessor: "status",
          disableSortBy: true,
          disableFilters: true,
          Cell: BuilderStatusCellComponent,
        },
        {
          Header: "Builds",
          accessor: "builds",
          sortDescFirst: true,
          disableFilters: true,
          Cell: BuilderBuildsCellComponent,
        },
        {
          Header: "Batch",
          accessor: "batch",
          disableFilters: true,
          Filter: BatchFilterComponent,
          filter: batchFiltering,
          sortType: (rowA, rowB) => {
            const aNumber = rowA.original.batch?.number ?? 0;
            const bNumber = rowB.original.batch?.number ?? 0;

            return aNumber - bNumber;
          },
          Cell: BatchTableCellComponent,
        },
        {
          Header: "Socials",
          accessor: "socials",
          disableSortBy: true,
          disableFilters: true,
          Cell: BuilderSocialLinksCellComponent,
        },
        {
          Header: "User Created",
          accessor: "userCreated",
          sortAscFirst: true,
          disableFilters: true,
          Cell: UserCreatedCellComponent,
        },
      ];

      if (!isLoggedIn) {
        allColumns.splice(4, 1);
      }

      return allColumns;
    },
    // eslint-disable-next-line
    [userRole, BatchFilterComponent, builders],
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
      data: builders,
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "batch", desc: true }], []) },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    setAmountBuilders(builders.length);
  }, [builders]);

  const ensFilter = headerGroups[0].headers[0];
  const batchFilter = headerGroups[0].headers[3];

  return (
    <Container maxW="container.xl">
      {isLoadingBuilders ? (
        <BuilderListSkeleton />
      ) : (
        <Box overflowX={{ base: "auto", lg: "visible" }} mb={8}>
          <Center mb={5} flexDir="column">
            <Box mb={2}>
              <chakra.strong mr={2}>Total builders:</chakra.strong>
              {amountBuilders}
            </Box>
            <Flex direction={{ base: "column", md: "row" }} alignItems="center" mb={4}>
              <InputGroup mr={{ md: 4 }} mb={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto" }} height="40px">
                {ensFilter.render("Filter")}
                <InputRightElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<SearchIcon />} />
              </InputGroup>

              <Box width={{ base: "100%", md: "auto" }} height="40px">
                {batchFilter.render("Filter")}
              </Box>
            </Flex>
          </Center>
          <Table
            {...getTableProps()}
            wordBreak={{ base: "normal", lg: "break-word" }}
            background={baseColor}
            colorScheme="customBaseColorScheme"
            size="sm"
          >
            <Thead>
              {headerGroups.map((headerGroup, index) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
                  {headerGroup.headers.map(column => (
                    <Th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id} whiteSpace="nowrap">
                      {column.render("Header")}
                      <chakra.span key={`span-${index}`} pl="4">
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
                  <Tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map(cell => (
                      <Td {...cell.getCellProps()} key={cell.column.id}>
                        {cell.render("Cell")}
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
