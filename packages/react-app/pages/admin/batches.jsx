import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
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
  Input,
  InputRightElement,
  InputGroup,
  IconButton,
} from "@chakra-ui/react";

import BatchNameCell from "../../components/batches/BatchNameCell";
import { SearchIcon, TriangleDownIcon, TriangleUpIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import BatchLinksCell from "../../components/batches/BatchLinksCell";
import BatchStatusCell from "../../components/batches/BatchStatusCell";
import ExactDateWithTooltip from "../../components/batches/ExactDateWithTooltip";
import { USER_ROLES } from "../../helpers/constants";
import { BatchCrudFormModal } from "../../components/batches/BatchCrudForm";
import BatchesListSkeleton from "../../components/skeletons/BatchesListSkeleton";

const serverPathBatches = "/batches";

const BatchColumnFilter = ({ column: { filterValue, setFilter } }) => {
  const { baseColor } = useCustomColorModes();

  return (
    <Input
      type="text"
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      placeholder="Search for batch"
      bgColor={baseColor}
      mb={8}
    />
  );
};

export default function Batches({ serverUrl, userRole, mainnetProvider }) {
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const { baseColor } = useCustomColorModes();
  const isAdmin = userRole === USER_ROLES.admin;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const batchFiltering = (rows, id, filterValue) => {
    return rows.filter(row => {
      const rowValue = row.values[id];
      const rowValueString = String(rowValue).toLowerCase();
      const filterValueString = String(filterValue).toLowerCase();
      return rowValueString.includes(filterValueString);
    });
  };

  const fetchBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    try {
      const fetchedBatches = await axios.get(serverUrl + serverPathBatches);
      setBatches(fetchedBatches.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const BatchNameCellComponent = ({ row }) => <BatchNameCell batch={row.original.name} status={row.original.status} />;
  const BatchCreatedCellComponent = ({ value }) => {
    return <ExactDateWithTooltip timestamp={value} />;
  };
  const BatchLinksCellComponent = ({ row }) => {
    return <BatchLinksCell batch={row.original} />;
  };
  const BatchStatusCellComponent = ({ value }) => <BatchStatusCell status={value} />;
  const BatchBuildersCountCellComponent = ({ row }) => {
    const gradCount = row.original.graduates;
    const partCount = row.original.totalParticipants;
    return (
      <Text textAlign="center">
        {gradCount} / {partCount}
      </Text>
    );
  };

  const BatchEditComponent = ({ row }) => (
    <Tooltip label="Edit Batch">
      <IconButton
        aria-label="Edit batch"
        icon={<EditIcon />}
        size="sm"
        variant="ghost"
        isDisabled={!isAdmin}
        onClick={() => {
          setSelectedBatch({
            ...row.original,
            id: row.original.id,
          });
          setIsEditModalOpen(true);
        }}
      />
    </Tooltip>
  );

  const columns = useMemo(
    () => {
      const allColumns = [
        {
          Header: "Batch",
          accessor: "name",
          canFilter: true,
          Filter: BatchColumnFilter,
          filter: batchFiltering,
          Cell: BatchNameCellComponent,
        },
        {
          Header: "Status",
          accessor: "status",
          disableSortBy: true,
          disableFilters: true,
          Cell: BatchStatusCellComponent,
        },
        {
          Header: "Start Date",
          accessor: "startDate",
          disableFilters: true,
          Cell: BatchCreatedCellComponent,
        },
        {
          Header: "Graduates / Participants",
          accessor: row => row.graduates,
          disableFilters: true,
          Cell: BatchBuildersCountCellComponent,
          headerAlign: "center",
        },
        {
          Header: "Links",
          accessor: row => row.original,
          disableSortBy: true,
          disableFilters: true,
          Cell: BatchLinksCellComponent,
        },
        {
          Header: "Edit",
          disableSortBy: true,
          disableFilters: true,
          Cell: BatchEditComponent,
        },
      ];

      if (!isAdmin) {
        allColumns.splice(5, 1);
      }

      return allColumns;
    },
    // eslint-disable-next-line
    [userRole],
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
      data: batches,
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "startDate", desc: true }], []) },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const batchFilter = headerGroups[0].headers[0];

  return (
    <>
      <Container maxW="container.xl">
        {isLoadingBatches ? (
          <BatchesListSkeleton />
        ) : (
          <Box overflowX={{ base: "auto", lg: "visible" }} mb={8}>
            <Center mb={5} flexDir="column">
              <Box mb={2}>
                <chakra.strong mr={2}>Total batches:</chakra.strong>
                {batches.length}
              </Box>
              <Flex direction={{ base: "column", md: "row" }} alignItems="center" mb={4}>
                <InputGroup mr={{ md: 4 }} mb={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto" }} height="40px">
                  {batchFilter.render("Filter")}
                  <InputRightElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<SearchIcon />} />
                </InputGroup>
                <Button
                  leftIcon={<AddIcon />}
                  isDisabled={!isAdmin}
                  colorScheme="blue"
                  onClick={() => setIsAddModalOpen(true)}
                  width={{ base: "100%", md: "auto" }}
                >
                  Add Batch
                </Button>
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
                      <Th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        key={column.id}
                        whiteSpace="nowrap"
                        textAlign={column.headerAlign || "left"}
                      >
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
                        <Td {...cell.getCellProps()} key={cell.column.id} textAlign={cell.column.align || "left"}>
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

      {/* Add Batch Modal */}
      <BatchCrudFormModal
        mainnetProvider={mainnetProvider}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUpdate={() => {
          setIsAddModalOpen(false);
          fetchBatches();
        }}
      />

      {/* Edit Batch Modal */}
      <BatchCrudFormModal
        mainnetProvider={mainnetProvider}
        batch={selectedBatch}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => {
          setIsEditModalOpen(false);
          fetchBatches();
        }}
      />
    </>
  );
}
