import React from "react";
import NextLink from "next/link";
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
  COHORT_WITHDRAW: "cohort.withdraw",
};

export const eventDisplay = ({ type, payload }) => {
  switch (type) {
    case EVENT_TYPES.BUILD_SUBMIT: {
      return (
        <>
          just submitted a new build:{" "}
          <NextLink href={`/build/${payload.buildId}`} passHref>
            <Link textDecoration="underline">{payload.name}</Link>
          </NextLink>
        </>
      );
    }

    case EVENT_TYPES.BUILD_EDIT: {
      return (
        <>
          just edited a build:{" "}
          <NextLink href={`/build/${payload.buildId}`} passHref>
            <Link textDecoration="underline">{payload.name}</Link>
          </NextLink>
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
          <NextLink href={`/build/${payload.buildId}`} passHref>
            <Link textDecoration="underline">{payload.name}</Link>
          </NextLink>{" "}
          has been {payload.featured ? "featured" : "unfeatured"}`
        </>
      );
    }

    case EVENT_TYPES.BUILD_LIKED: {
      return (
        <>
          {payload.liked ? "liked" : "unliked"} the build{" "}
          <NextLink href={`/build/${payload.buildId}`} passHref>
            <Link textDecoration="underline">{payload.name}</Link>
          </NextLink>
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
            <NextLink href={`/builders/${payload.builderAddress}`} passHref>
              <Link pos="relative">
                <Address address={payload.builderAddress} w="10" fontSize="16" />
              </Link>
            </NextLink>
          </Text>
        </>
      );
    }

    case EVENT_TYPES.COHORT_WITHDRAW: {
      return (
        <>
          <Text>withdrew Ξ {parseFloat(payload.amount).toFixed(4)}</Text>
          <Text fontWeight="bold" mt={2} wordBreak="break-all">
            From «{payload.cohortName}»
          </Text>
          <Text fontStyle="italic" mt={2} wordBreak="break-all">
            "{payload.reason}"
          </Text>
        </>
      );
    }

    default:
      // do nothing
      return "";
  }
};
