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
import StreamTableCell from "../../components/StreamTableCell";
import DateWithTooltip from "../../components/DateWithTooltip";

const serverPath = "/builders/batches";

const batchCreated = batch => {
  return batch?.creationTimestamp || 0;
};

// TODO
const BatchLinksCell = ({ builder, isAdmin }) => {
  // const socials = Object.entries(builder.socialLinks ?? {}).sort(bySocialWeight);
  // return (
  //   <Flex direction="column">
  //     <HStack spacing={3} alignItems="center" justifyContent="center">
  //       {socials.length ? (
  //         socials.map(([socialId, socialValue]) => <SocialLink id={socialId} key={socialId} value={socialValue} />)
  //       ) : (
  //         <Box>-</Box>
  //       )}
  //     </HStack>
  //     {isAdmin && <BuilderFlags builder={builder} />}
  //   </Flex>
  // );
};

// TODO
const BatchStatusCell = ({ status }) => {
  return (
    <Tooltip label={moment(status?.timestamp).fromNow()}>
      <Text maxW="350">{status?.text}</Text>
    </Tooltip>
  );
};

export default function Batches({ serverUrl, userRole }) {
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  useEffect(() => {
    async function fetchBatches() {
      setIsLoadingBatches(true);
      const fetchedBatches = await axios.get(serverUrl + serverPath);

      const processedBatches = fetchedBatches.data.map(batch => ({
        // batch,
        batchNumber: batch.id,
        status: batch.status,
        telegram: batch.telegramLink,
        contractAddress: batch.contractAddress,
        startDate: batch.startDate,
      }));

      setBatches(processedBatches);
      setIsLoadingBatches(false);
    }

    fetchBatches();
  }, [serverUrl]);

  const BatchNumberCellComponent = ({ value }) => {
    return value?.graduated?.status ? "" : <StreamTableCell builder={value} />;
  };

  const BatchCreatedCellComponent = ({ value }) => {
    return <DateWithTooltip timestamp={value} />;
  };

  const BatchLinksCellComponent = ({ value }) => <BatchLinksCell batch={value} isAdmin={isAdmin} />;

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
          Filter: BatchFilterComponent,
          filter: batchFiltering,
          Cell: StreamTableCellComponent,
        },
        // have Etherscan, Github, Telegram, Website
        {
          Header: "Links",
          accessor: "links",
          disableSortBy: true,
          disableFilters: true,
          Cell: BatchLinksCellComponent,
        },
        {
          Header: "Batch Created",
          accessor: "batchCreated",
          sortAscFirst: true,
          disableFilters: true,
          Cell: BatchCreatedCellComponent,
        },
      ];

      if (!isLoggedIn) {
        allColumns.splice(4, 1);
      }

      return allColumns;
    },
    // eslint-disable-next-line
    [userRole, BatchFilterComponent, batches],
  );

  //   const {
  //     getTableProps,
  //     getTableBodyProps,
  //     headerGroups,
  //     prepareRow,
  //     page,
  //     canPreviousPage,
  //     canNextPage,
  //     pageOptions,
  //     pageCount,
  //     gotoPage,
  //     nextPage,
  //     previousPage,
  //     setPageSize,
  //     state: { pageIndex, pageSize },
  //   } = useTable(
  //     {
  //       columns,
  //       data: builders,
  //       initialState: { pageIndex: 0, pageSize: 25, sortBy: useMemo(() => [{ id: "stream", desc: true }], []) },
  //     },
  //     useFilters,
  //     useSortBy,
  //     usePagination,
  //   );

  return (
    <>
      <h1>Admin Batches</h1>;<button onClick={() => console.log(batches)}>Refresh</button>
    </>
  );
}
