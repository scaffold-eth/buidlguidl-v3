import React from "react";
import { Link as RouteLink } from "react-router-dom";
import { Link, Text } from "@chakra-ui/react";
import Address from "../components/Address";

// TODO PR: how do we keep just one instance of this enum? Like a commons library
export const EVENT_TYPES = {
  BUILD_SUBMIT: "build.submit",
  BUILD_EDIT: "build.edit",
  BUILD_DELETE: "build.delete",
  BUILD_FEATURED: "build.featured",
  BUILD_LIKED: "build.liked",
  USER_CREATE: "user.create",
  USER_UPDATE_STATUS: "user.update_status",
  STREAM_WITHDRAW: "stream.withdraw",
  STREAM_DEPOSIT: "stream.deposit",
};

export const eventDisplay = ({ type, payload }) => {
  switch (type) {
    case EVENT_TYPES.BUILD_SUBMIT: {
      return (
        <>
          just submitted a new build:{" "}
          <Link as={RouteLink} to={`/build/${payload.buildId}`} textDecoration="underline">
            {payload.name}
          </Link>
        </>
      );
    }

    case EVENT_TYPES.BUILD_EDIT: {
      return (
        <>
          just edited a build:{" "}
          <Link as={RouteLink} to={`/build/${payload.buildId}`} textDecoration="underline">
            {payload.name}
          </Link>
        </>
      );
    }

    case EVENT_TYPES.BUILD_DELETE: {
      return `just deleted a build: "${payload.name}"`;
    }

    case EVENT_TYPES.BUILD_FEATURED: {
      return (
        <>
          Their build{" "}
          <Link as={RouteLink} to={`/build/${payload.buildId}`} textDecoration="underline">
            {payload.name}
          </Link>{" "}
          has been {payload.featured ? "featured" : "unfeatured"}`
        </>
      );
    }

    case EVENT_TYPES.BUILD_LIKED: {
      return (
        <>
          {payload.liked ? "liked" : "unliked"} the build{" "}
          <Link as={RouteLink} to={`/build/${payload.buildId}`} textDecoration="underline">
            {payload.name}
          </Link>
        </>
      );
    }

    case EVENT_TYPES.USER_CREATE: {
      return `is a new builder on BuidlGuidl. Welcome! ${payload.fromApiCall ? "(from SRE)" : ""}`;
    }

    case EVENT_TYPES.USER_UPDATE_STATUS: {
      return `updated their status: "${payload.text}"`;
    }

    case EVENT_TYPES.STREAM_WITHDRAW: {
      return (
        <>
          <Text>withdrew Ξ {parseFloat(payload.amount).toFixed(4)}</Text>
          <Text fontStyle="italic" mt={2} wordBreak="break-all">
            "{payload.reason}"
          </Text>
        </>
      );
    }

    case EVENT_TYPES.STREAM_DEPOSIT: {
      return (
        <>
          <Text>funded with Ξ {parseFloat(payload.amount).toFixed(4)} to </Text>
          <Text mt={2}>
            <Link as={RouteLink} to={`/builders/${payload.builderAddress}`} pos="relative">
              <Address address={payload.builderAddress} w="10" fontSize="16" />
            </Link>
          </Text>
        </>
      );
    }

    // ToDo. Build events. Wait until we tackled issue #134
    // https://github.com/moonshotcollective/scaffold-directory/issues/134

    default:
      // do nothing
      return "";
  }
};
