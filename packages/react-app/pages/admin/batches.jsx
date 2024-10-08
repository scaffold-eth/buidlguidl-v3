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
} from "@chakra-ui/react";
import DateWithTooltip from "../../components/DateWithTooltip";
import BatchNumberCell from "../../components/batches/BatchNumberCell";
import { CopyIcon, SearchIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import BuilderListSkeleton from "../../components/skeletons/BuilderListSkeleton";
import BatchLinksCell from "../../components/batches/BatchLinksCell";
import BatchStatusCell from "../../components/batches/BatchStatusCell";
import ExactDateWithTooltip from "../../components/batches/ExactDateWithTooltip";

const serverPath = "/builders/batches";

export default function Batches({ serverUrl, userRole }) {
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const { baseColor } = useCustomColorModes();

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

  const BatchNumberCellComponent = ({ row }) => {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BatchNumberCell batch={row.original.batchNumber} status={row.original.status} />
      </div>
    );
  };
  const BatchCreatedCellComponent = ({ value }) => {
    return <ExactDateWithTooltip timestamp={value} />;
  };
  const BatchLinksCellComponent = ({ value }) => <BatchLinksCell batch={value} />;
  const BatchStatusCellComponent = ({ value }) => <BatchStatusCell status={value} />;

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
        // have Etherscan, Github, Telegram, Website
        {
          Header: "Links",
          accessor: "batch",
          disableSortBy: true,
          disableFilters: true,
          Cell: BatchLinksCellComponent,
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
    </>
  );
}
