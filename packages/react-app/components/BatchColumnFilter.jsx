import React, { useState, useMemo } from "react";
import { Button, Input, List, ListItem, Popover, PopoverTrigger, PopoverContent, PopoverBody } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BatchColumnFilter = ({ filterValue = "allBatches", setFilter, builders }) => {
  const { baseColor } = useCustomColorModes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const batchBuilders = builders.filter(builder => builder.builder.batch?.number);

  const uniqueBatches = useMemo(() => {
    return Array.from(new Set(batchBuilders.map(builder => builder.builder.batch?.number)));
  }, [batchBuilders]);

  const filteredBatches = useMemo(() => {
    return [
      ...(searchTerm === "" || "All Batches".toLowerCase().includes(searchTerm.toLowerCase()) ? ["allBatches"] : []),
      ...uniqueBatches
        .filter(batch => `Batch ${batch}`.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.localeCompare(a)),
    ];
  }, [uniqueBatches, searchTerm]);

  const getButtonLabel = () => {
    if (filterValue === "allBatches") {
      return "All Batches";
    } else if (filterValue) {
      return `Batch ${filterValue}`;
    } else {
      return "All Builders";
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSelect = batch => {
    setFilter(batch);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover isOpen={isOpen} onClose={handleClose} placement="bottom-start">
      <PopoverTrigger>
        <Button
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          bgColor={baseColor}
          width="250px"
          borderRadius="md"
          fontWeight="normal"
        >
          {getButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="250px">
        <PopoverBody padding={0}>
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            padding="8px 12px"
            borderRadius="md"
            borderWidth="0 0 1px 0"
            _focus={{
              bg: "gray.50",
              borderColor: "gray.200",
            }}
          />
          <List maxHeight="200px" overflowY="auto">
            {filteredBatches.map((batch, index) => (
              <ListItem
                key={index}
                padding="8px 12px"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                bg={filterValue === batch ? "blue.100" : "white"}
                onClick={() => handleSelect(batch)}
              >
                {batch === "allBatches" ? "All Batches" : `Batch ${batch}`}
              </ListItem>
            ))}
          </List>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default BatchColumnFilter;
