import React, { useState, useMemo } from "react";
import { Button, Input, List, ListItem, Popover, PopoverTrigger, PopoverContent, PopoverBody } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BatchColumnFilter = ({ filterValue, setFilter, builders }) => {
  const { baseColor } = useCustomColorModes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const batchBuilders = builders.filter(builder => builder.builder.builderBatch);
  const uniqueBatches = Array.from(new Set(batchBuilders.map(builder => builder.builder.builderBatch)));

  const filteredBatches = uniqueBatches.filter(batch => batch.includes(searchTerm)).sort((a, b) => b.localeCompare(a));

  const getButtonLabel = () => {
    if (filterValue === "allBuilders") {
      return "All Builders";
    } else if (filterValue === "allBatches") {
      return "All Batches";
    } else if (filterValue) {
      return `Batch ${filterValue}`;
    } else {
      return "All Builders";
    }
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start">
      <PopoverTrigger>
        <Button
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          bgColor={baseColor}
          width="200px"
          borderRadius="md"
          fontWeight="normal"
        >
          {getButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="200px">
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
            <ListItem
              padding="8px 12px"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              onClick={() => {
                setFilter("allBuilders");
                setIsOpen(false);
              }}
            >
              All Builders
            </ListItem>
            <ListItem
              padding="8px 12px"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              onClick={() => {
                setFilter("allBatches");
                setIsOpen(false);
              }}
            >
              All Batches
            </ListItem>
            {filteredBatches.map((batch, index) => (
              <ListItem
                key={index}
                padding="8px 12px"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                onClick={() => {
                  setFilter(batch);
                  setIsOpen(false);
                }}
              >
                Batch {batch}
              </ListItem>
            ))}
          </List>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default BatchColumnFilter;
