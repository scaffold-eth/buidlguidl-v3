import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
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
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import DateWithTooltip from "../../components/DateWithTooltip";
import BatchNumberCell from "../../components/batches/BatchNumberCell";
import { CopyIcon, SearchIcon, TriangleDownIcon, TriangleUpIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import BuilderListSkeleton from "../../components/skeletons/BuilderListSkeleton";
import BatchLinksCell from "../../components/batches/BatchLinksCell";
import BatchStatusCell from "../../components/batches/BatchStatusCell";
import ExactDateWithTooltip from "../../components/batches/ExactDateWithTooltip";
import { BatchCrudForm } from "../../components/batches/BatchCrudForm";
import { USER_ROLES } from "../../helpers/constants";

const serverPathBatches = "/builders/batches";
const serverPathBatchGraduateBuilders = "/builders/batchGraduateBuilders";

// TODO: double check this, adapt to batch number
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
  const [amountBatches, setAmountBatches] = useState();
  const [graduatesCount, setGraduatesCount] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
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
      const processedBatches = fetchedBatches.data.map(batch => ({
        batch: batch,
        batchNumber: batch.number,
        status: batch.status,
        startDate: batch.startDate,
      }));
      setBatches(processedBatches);
      setAmountBatches(processedBatches.length);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [serverUrl]);

  const fetchGraduatesCount = useCallback(async () => {
    const fetchedBatchGraduateBuilders = await axios.get(serverUrl + serverPathBatchGraduateBuilders);
    const graduatesCounts = {};

    batches.forEach(
      batch => {
        const batchNumber = batch.batchNumber;
        graduatesCounts[batchNumber] = 0;

        fetchedBatchGraduateBuilders.data.forEach(builder => {
          if (builder.batch && builder.batch.number === String(batchNumber)) {
            graduatesCounts[batchNumber]++;
          }
        });
      },
      [batches],
    );

    setGraduatesCount(graduatesCounts);
  }, [batches, serverUrl]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    if (batches.length > 0) {
      fetchGraduatesCount();
    }
  }, [batches, fetchGraduatesCount]);

  const BatchNumberCellComponent = ({ row }) => (
    <BatchNumberCell batch={row.original.batchNumber} status={row.original.status} />
  );
  const BatchCreatedCellComponent = ({ value }) => {
    return <ExactDateWithTooltip timestamp={value} />;
  };
  const BatchLinksCellComponent = ({ value }) => <BatchLinksCell batch={value} />;
  const BatchStatusCellComponent = ({ value }) => <BatchStatusCell status={value} />;
  const BatchGraduatesCellComponent = ({ row }) => {
    const count = graduatesCount[row.original.batchNumber] || 0;
    return <Text>{count}</Text>;
  };

  const BatchEditComponent = ({ row }) => (
    <Tooltip label="Edit Batch">
      <IconButton
        aria-label="Edit batch"
        icon={<EditIcon />}
        size="sm"
        variant="ghost"
        onClick={() => {
          setSelectedBatch(row.original.batch);
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
          accessor: "batchNumber",
          //   disableSortBy: true,
          canFilter: true,
          Filter: BatchColumnFilter,
          filter: batchFiltering,
          Cell: BatchNumberCellComponent,
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
          Header: "Graduates",
          accessor: row => graduatesCount[row.batchNumber] || 0,
          disableFilters: true,
          Cell: BatchGraduatesCellComponent,
        },
        {
          Header: "Links",
          accessor: "batch",
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

      // if (!isLoggedIn) {
      //   allColumns.splice(4, 1);
      // }

      return allColumns;
    },
    // eslint-disable-next-line
    [userRole, batches, graduatesCount],
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
      initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "stream", desc: true }], []) },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const handleSearch = value => {
    setSearchTerm(value);
    // You may want to implement actual filtering logic here
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const batchFilter = headerGroups[0].headers[0];

  return (
    <>
      <Container maxW="container.xl">
        {isLoadingBatches ? (
          // TODO: double check BuilderListSkeleton
          <BuilderListSkeleton />
        ) : (
          <Box overflowX={{ base: "auto", lg: "visible" }} mb={8}>
            <Center mb={5} flexDir="column">
              <Box mb={2}>
                <chakra.strong mr={2}>Total batches:</chakra.strong>
                {amountBatches}
              </Box>
              <Flex direction={{ base: "column", md: "row" }} alignItems="center" mb={4}>
                <InputGroup mr={{ md: 4 }} mb={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto" }} height="40px">
                  {batchFilter.render("Filter")}
                  <InputRightElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<SearchIcon />} />
                </InputGroup>
                <Button
                  leftIcon={<AddIcon />}
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
          </Box>
        )}
      </Container>

      {/* Add Batch Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Batch</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BatchCrudForm
              mainnetProvider={mainnetProvider}
              onUpdate={() => {
                setIsAddModalOpen(false);
                fetchBatches();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Batch</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BatchCrudForm
              mainnetProvider={mainnetProvider}
              batch={selectedBatch}
              onUpdate={() => {
                setIsEditModalOpen(false);
                fetchBatches();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
