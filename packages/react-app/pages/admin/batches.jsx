import React, { useEffect, useState, useMemo } from "react";
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
import { CopyIcon, SearchIcon, TriangleDownIcon, TriangleUpIcon, EditIcon } from "@chakra-ui/icons";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import BuilderListSkeleton from "../../components/skeletons/BuilderListSkeleton";
import BatchLinksCell from "../../components/batches/BatchLinksCell";
import BatchStatusCell from "../../components/batches/BatchStatusCell";
import ExactDateWithTooltip from "../../components/batches/ExactDateWithTooltip";
import { USER_ROLES } from "../../helpers/constants";

const serverPath = "/builders/batches";

export default function Batches({ serverUrl, userRole }) {
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const { baseColor } = useCustomColorModes();
  const isAdmin = userRole === USER_ROLES.admin;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    async function fetchBatches() {
      setIsLoadingBatches(true);
      const fetchedBatches = await axios.get(serverUrl + serverPath);

      const processedBatches = fetchedBatches.data.map(batch => ({
        batch: batch,
        batchNumber: batch.number,
        status: batch.status,
        startDate: batch.startDate,
      }));

      setBatches(processedBatches);
      setIsLoadingBatches(false);
    }

    fetchBatches();
  }, [serverUrl]);

  const BatchNumberCellComponent = ({ row }) => (
    <BatchNumberCell batch={row.original.batchNumber} status={row.original.status} />
  );
  const BatchCreatedCellComponent = ({ value }) => {
    return <ExactDateWithTooltip timestamp={value} />;
  };
  const BatchLinksCellComponent = ({ value }) => <BatchLinksCell batch={value} />;
  const BatchStatusCellComponent = ({ value }) => <BatchStatusCell status={value} />;
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
          //   canFilter: true,
          //   Filter: EnsColumnFilter,
          //   filter: ensFiltering,
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
          // Filter: BatchFilterComponent,
          // filter: batchFiltering,
          Cell: BatchCreatedCellComponent,
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
    [userRole, batches],
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

  const batchFilter = headerGroups[0].headers[0];

  return (
    <>
      <Container maxW="container.xl">
        {isLoadingBatches ? (
          <BuilderListSkeleton />
        ) : (
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
        )}
      </Container>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Batch</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* TODO:Add form fields for editing the batch */}
            {selectedBatch && (
              <div>
                <Text>Editing Batch: {selectedBatch.number}</Text>
                {/* Add more fields as needed */}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="ghost">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
