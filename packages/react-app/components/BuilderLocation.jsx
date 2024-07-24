import React, { useEffect, useState, useRef } from "react";
import ReactCountryFlag from "react-country-flag";
import ReactFlagsSelect from "react-flags-select";
import {
  Box,
  Button,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  FormControl,
  useTheme,
} from "@chakra-ui/react";
import useSignedRequest from "../hooks/useSignedRequest";
import useConnectedAddress from "../hooks/useConnectedAddress";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BuilderLocation = ({ builder }) => {
  const theme = useTheme();
  const address = useConnectedAddress();
  const [currentLocation, setCurrentLocation] = useState(builder?.location);
  const [newLocation, setNewLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateLocation", builder?.id);
  const { secondaryFontColor } = useCustomColorModes();
  const flagsSelectRef = useRef(null);
  const bgColorSelect = useColorModeValue("white", theme.colors.dark.baseBlue);
  const textColorSelect = useColorModeValue("black", "white");
  const isMyProfile = address === builder?.id;

  useEffect(() => {
    setCurrentLocation(builder?.location);
  }, [builder]);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleSetLocation = async () => {
    let builderResponse;
    try {
      builderResponse = await makeSignedRequest({ location: newLocation });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      description: "Location updated",
      variant: toastVariant,
    });
    onClose();
    setNewLocation("");
    setCurrentLocation(builderResponse.location);
  };

  const handleFlagSelect = countryCode => {
    setNewLocation(countryCode);
    // Close the dropdown after selection (bug in ReiactFlagsSelect)
    if (flagsSelectRef.current) {
      const selectButton = flagsSelectRef.current.querySelector("#rfs-btn");
      if (selectButton) {
        selectButton.click();
      }
    }
  };

  return (
    <>
      <Box mb={3}>
        <Box textAlign="center" fontStyle="italic">
          {currentLocation ? (
            <Tooltip label={currentLocation}>
              <div>
                <ReactCountryFlag
                  className="emojiFlag"
                  countryCode={currentLocation}
                  style={{
                    fontSize: "1em",
                    lineHeight: "1em",
                  }}
                  aria-label={currentLocation}
                />
              </div>
            </Tooltip>
          ) : (
            isMyProfile && <Text color={secondaryFontColor}>No location set</Text>
          )}
        </Box>
        {isMyProfile && (
          <Button mt={3} size="xs" variant="outline" onClick={onOpen} isFullWidth colorScheme="customBaseColorScheme">
            Update location
          </Button>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="status" key="status" mb={3}>
              <FormLabel htmlFor="status" mb={0}>
                <strong>Location</strong>
              </FormLabel>
              <div className="flag-selector" ref={flagsSelectRef}>
                <ReactFlagsSelect searchable selected={newLocation} onSelect={handleFlagSelect} />
              </div>
            </FormControl>
            <Button colorScheme="blue" px={4} onClick={handleSetLocation} isLoading={isLoading} isFullWidth>
              Update
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* ReactFlagsSelect doesn't allow proper styling */}
      <style jsx global>{`
        .flag-selector ul,
        .flag-selector #rfs-btn,
        .flag-selector ul > div,
        .flag-selector input {
          background-color: ${bgColorSelect};
          color: ${textColorSelect};
        }
      `}</style>
    </>
  );
};

export default BuilderLocation;
