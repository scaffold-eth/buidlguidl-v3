import React, { useEffect, useState, useMemo } from "react";
import { Link as RouteLink } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { ethers } from "ethers";
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
  Flex,
  Select,
  Badge,
  Tooltip,
  Progress,
} from "@chakra-ui/react";
import { useTable, usePagination, useSortBy } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuilderListSkeleton from "../components/skeletons/BuilderListSkeleton";
import DateWithTooltip from "../components/DateWithTooltip";
import SocialLink from "../components/SocialLink";
import Address from "../components/Address";
import EthIcon from "../components/icons/EthIcon";
import { bySocialWeight } from "../data/socials";
import { USER_ROLES } from "../helpers/constants";

const serverPath = "/builders";

const builderLastActivity = builder => {
  // ToDo. Builds updated.
  // const lastChallengeUpdated = Object.values(builder?.challenges ?? {})
  //   .map(challenge => challenge.submittedTimestamp)
  //   .sort((t1, t2) => t2 - t1)?.[0];

  const lastStatusUpdated = builder?.status?.timestamp;

  return lastStatusUpdated ?? builder?.creationTimestamp;
};

const BuilderSocialLinksCell = ({ builder, isAdmin }) => {
  const socials = Object.entries(builder.socialLinks ?? {}).sort(bySocialWeight);
  if (!socials.length) return <Box>-</Box>;

  return (
    <Flex direction="column">
      <Flex justifyContent="space-evenly" alignItems="center">
        {socials.map(([socialId, socialValue]) => (
          <SocialLink id={socialId} key={socialId} value={socialValue} />
        ))}
      </Flex>
      {isAdmin && builder.reachedOut && (
        <Badge variant="outline" colorScheme="green" alignSelf="center" mt={2}>
          Reached Out
        </Badge>
      )}
    </Flex>
  );
};

const BuilderAddressCell = ({ builderId, mainnetProvider }) => {
  return (
    <Link as={RouteLink} to={`/builders/${builderId}`} pos="relative">
      <Address address={builderId} ensProvider={mainnetProvider} w="12.5" fontSize="16" />
    </Link>
  );
};

const BuilderStatusCell = ({ status }) => {
  return (
    <Tooltip label={moment(status?.timestamp).fromNow()}>
      <Text>{status?.text}</Text>
    </Tooltip>
  );
};

const secondsPerDay = 24 * 60 * 60;
const BuilderStreamCell = ({ stream }) => {
  if (!stream) return <Box>-</Box>;

  const cap = ethers.BigNumber.from(stream.cap);
  const frequency = stream.frequency;
  const frequencyDays = frequency / secondsPerDay;
  const vestedPercentage = (new Date().getTime() / 1000 - stream.last) / frequency;
  const vestedAmount = cap.mul(Math.round(new Date().getTime() / 1000 - stream.last)).div(frequency);
  const available = cap.lt(vestedAmount) ? cap : vestedAmount;

  const balanceStr = ethers.utils.formatEther(stream.balance);
  const capStr = ethers.utils.formatEther(cap);
  const availableStr = ethers.utils.formatEther(available);
  return (
    <Box>
      <Flex align="center" justify="end">
        <EthIcon w={4} mr={1} />
        {balanceStr ?? 0}
      </Flex>
      <Flex align="center" justify="end">
        <EthIcon w={4} mr={1} />
        {capStr} / {frequencyDays}d
      </Flex>
      <Flex align="center" justify="end" direction="column">
        <Box mb={1}>
          <Box mb={1}>
            <EthIcon w={4} mr={1} />
            {Math.round(availableStr * 1e5) / 1e5}
          </Box>
          <Box w="full" pl={1}>
            <Progress flexShrink={1} size="xs" value={vestedPercentage * 100} colorScheme="green" />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default function BuilderListView({ serverUrl, mainnetProvider, userRole }) {
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);
  const { secondaryFontColor } = useCustomColorModes();
  const isAdmin = userRole === USER_ROLES.admin;

  const columns = useMemo(
    () => [
      {
        Header: "Builder",
        accessor: "builder",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderAddressCell builderId={value} mainnetProvider={mainnetProvider} />,
      },
      {
        Header: "Status",
        accessor: "status",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderStatusCell status={value} />,
      },
      {
        Header: "Stream",
        accessor: "stream",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderStreamCell stream={value} />,
      },
      {
        Header: "Socials",
        accessor: "socials",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderSocialLinksCell builder={value} isAdmin={isAdmin} />,
      },
      {
        Header: "Last Activity",
        accessor: "lastActivity",
        sortDescFirst: true,
        Cell: ({ value }) => <DateWithTooltip timestamp={value} />,
      },
    ],
    // eslint-disable-next-line
    [userRole],
  );

  useEffect(() => {
    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await axios.get(serverUrl + serverPath);

      const processedBuilders = fetchedBuilders.data.map(builder => ({
        builder: builder.id,
        status: builder.status,
        stream: builder.stream,
        socials: builder, // Question shouldn't this be accessing builder.socialLinks?
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
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "lastActivity", desc: true }], []) },
    },
    useSortBy,
    usePagination,
  );

  return (
    <Container maxW="container.lg">
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          All Builders
        </Heading>
        <Text color={secondaryFontColor} textAlign="center">
          List of Ethereum builders creating products, prototypes, and tutorials with{" "}
          <Link href="https://github.com/scaffold-eth/scaffold-eth" color="teal.500" isExternal>
            scaffold-eth
          </Link>
          .
        </Text>
        <Text color={secondaryFontColor} mb="10">
          You can fund Eth development sending Eth to any stream.
        </Text>
      </Container>
      {isLoadingBuilders ? (
        <BuilderListSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total builders:</chakra.strong> {builders.length}
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
