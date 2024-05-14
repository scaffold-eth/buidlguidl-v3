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
import StreamTableCell from "../../components/StreamTableCell";
import MetaSeo from "../../components/MetaSeo";
import DotIcon from "../../components/icons/DotIcon";
import BuilderFlags from "../../components/builder/BuilderFlags";
import useCustomColorModes from "../../hooks/useCustomColorModes";

const serverPath = "/builders/batches";

const builderLastActivity = builder => {
  const lastBuildSubmission = builder?.builds?.reduce(
    (prevValue, currentValue) => {
      return { submittedTimestamp: Math.max(prevValue.submittedTimestamp, currentValue.submittedTimestamp) };
    },
    { submittedTimestamp: 0 },
  );
  const lastBuildSubmissionTimestamp = lastBuildSubmission?.submittedTimestamp || 0;

  const lastStatusUpdated = builder?.status?.timestamp || 0;

  return Math.max(builder?.creationTimestamp || 0, lastBuildSubmissionTimestamp, lastStatusUpdated);
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
  return (
    <Input
      type="text"
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      placeholder="Search builder"
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

export default function BuilderListView({ serverUrl, mainnetProvider, userRole }) {
  const [builders, setBuilders] = useState([]);
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
          Cell: ({ value }) => <BuilderAddressCell builder={value} mainnetProvider={mainnetProvider} />,
        },
        {
          Header: "Status",
          accessor: "status",
          disableSortBy: true,
          disableFilters: true,
          Cell: ({ value }) => <BuilderStatusCell status={value} />,
        },
        {
          Header: "Builds",
          accessor: "builds",
          sortDescFirst: true,
          disableFilters: true,
          Cell: ({ value }) => <BuilderBuildsCell buildCount={value} />,
        },
        {
          Header: "Stream",
          accessor: "stream",
          disableFilters: true,
          // Sorting by stream cap for now.
          sortType: (rowA, rowB) =>
            Number(rowA.values?.stream?.cap || 0) > Number(rowB.values?.stream?.cap || 0) ? 1 : -1,
          Cell: ({ value }) => (value?.graduated?.status ? "" : <StreamTableCell builder={value} />),
        },
        {
          Header: "Socials",
          accessor: "socials",
          disableSortBy: true,
          disableFilters: true,
          Cell: ({ value }) => <BuilderSocialLinksCell builder={value} isAdmin={isAdmin} />,
        },
        {
          Header: "Last Activity",
          accessor: "lastActivity",
          sortDescFirst: true,
          disableFilters: true,
          Cell: ({ value }) => (
            <Text whiteSpace="nowrap">
              <DateWithTooltip timestamp={value} />
            </Text>
          ),
        },
      ];

      if (!isLoggedIn) {
        allColumns.splice(4, 1);
      }

      return allColumns;
    },
    // eslint-disable-next-line
    [userRole],
  );

  useEffect(() => {
    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await axios.get(serverUrl + serverPath);

      const processedBuilders = fetchedBuilders.data
        .filter(builder => builder.ens !== "austingriffith.eth")
        .map(builder => ({
          builder,
          status: builder.status,
          stream: builder,
          builds: builder.builds?.length || 0,
          socials: builder,
          lastActivity: builderLastActivity(builder),
        }));

      setBuilders(processedBuilders);
      setIsLoadingBuilders(false);
    }

    fetchBuilders();
  }, [serverUrl]);

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
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "stream", desc: false }], []) },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const ensFilter = headerGroups[0].headers[0];

  return (
    <Container maxW="container.xl">
      <MetaSeo
        title="All Builders"
        description="These are all the builder that are part of the BuidlGuidl"
        image="/assets/infantry_thumb.jpeg"
      />
      {isLoadingBuilders ? (
        <BuilderListSkeleton />
      ) : (
        <Box overflowX={{ base: "auto", lg: "visible" }} mb={8}>
          <Center mb={5} flexDir="column">
            <Box mb={2}>
              <chakra.strong mr={2}>Total builders in Batches:</chakra.strong>
              {builders.length}
            </Box>
            <Box mb={8}>
              <InputGroup bgColor={baseColor}>
                {ensFilter.render("Filter")}
                <InputRightElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<SearchIcon />} />
              </InputGroup>
            </Box>
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
                  <Tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map(cell => (
                      <>
                        <Td {...cell.getCellProps()} key={cell.column.id}>
                          {cell.render("Cell")}
                        </Td>
                      </>
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
