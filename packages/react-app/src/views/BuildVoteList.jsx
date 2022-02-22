import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Icon,
} from "@chakra-ui/react";
import { useTable, usePagination, useSortBy } from "react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuilderListSkeleton from "../components/skeletons/BuilderListSkeleton";
import DateWithTooltip from "../components/DateWithTooltip";
import Address from "../components/Address";
import { getAllBuilds } from "../data/api";
import { bySubmittedTimestamp } from "../helpers/sorting";
import HeroIconHeart from "../components/icons/HeroIconHeart";
import useConnectedAddress from "../hooks/useConnectedAddress";

const BuildCell = ({ name, buildId }) => {
  return (
    <Link as={RouteLink} to={`/build/${buildId}`} pos="relative">
      <Text>{name}</Text>
    </Link>
  );
};

const BuilderAddressCell = ({ builderId }) => {
  return (
    <Link as={RouteLink} to={`/builders/${builderId}`} pos="relative">
      <Address address={builderId} w="12.5" fontSize="16" />
    </Link>
  );
};

const BuildLikedCell = ({ isLiked, likesAmount }) => {
  return (
    <Button variant="outline">
      <Icon as={HeroIconHeart} w={6} h={6} mr={2} active={isLiked} />
      <Text fontWeight={400}>{likesAmount}</Text>
    </Button>
  );
};

export default function BuildVoteList() {
  const address = useConnectedAddress();
  const [builds, setBuilds] = useState([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(false);
  const { secondaryFontColor } = useCustomColorModes();
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const fetchSubmittedBuilds = useCallback(async () => {
    setIsLoadingBuilds(true);
    let fetchedBuilds;
    try {
      fetchedBuilds = await getAllBuilds();
    } catch (error) {
      toast({
        description: "There was an error getting the builds. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsLoadingBuilds(false);
      return;
    }
    setBuilds(fetchedBuilds.sort(bySubmittedTimestamp));
    setIsLoadingBuilds(false);
  }, [toastVariant, toast]);

  useEffect(() => {
    fetchSubmittedBuilds();
  }, []);

  const sortByLikes = useMemo(
    () => (rowA, rowB) => {
      return rowA.values.likes?.length ?? 0 - rowB.values.likes?.length ?? 0;
    },
    [],
  );

  const columns = useMemo(
    () => [
      {
        Header: "Build",
        accessor: "name",
        disableSortBy: true,
        Cell: ({ row }) => <BuildCell name={row.original.name} buildId={row.original.id} />,
      },
      {
        Header: "Builder",
        accessor: "builder",
        disableSortBy: true,
        Cell: ({ value }) => <BuilderAddressCell builderId={value} />,
      },
      {
        Header: "Submitted",
        accessor: "submittedTimestamp",
        disableSortBy: true,
        Cell: ({ value }) => <DateWithTooltip timestamp={value} />,
      },
      {
        Header: "Likes",
        accessor: "likes",
        sortDescFirst: true,
        sortType: sortByLikes,
        Cell: ({ value }) => <BuildLikedCell isLiked={value?.includes?.(address)} likesAmount={value?.length ?? 0} />, // TODO update this when there are likes
      },
    ],
    // eslint-disable-next-line
    [],
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
      data: builds,
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "likes", desc: true }], []) },
    },
    useSortBy,
    usePagination,
  );

  return (
    <Container maxW="container.lg">
      <Container maxW="container.md" centerContent>
        <Heading as="h1" mb="4">
          All Builds
        </Heading>
        <Text color={secondaryFontColor} mb="10" textAlign="center">
          List of builds by builders of the guild. Upvote your favourite builds.
        </Text>
      </Container>
      {isLoadingBuilds ? (
        <BuilderListSkeleton />
      ) : (
        <Box overflowX="auto" mb={8}>
          <Center mb={5}>
            <chakra.strong mr={2}>Total builds:</chakra.strong> {builds.length}
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
