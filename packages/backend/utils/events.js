const EVENT_TYPES = {
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

// TODO we could check here if the payload is correct for the type
const createEvent = (type, payload, signature) => ({
  type,
  timestamp: new Date().getTime(),
  signature,
  payload,
});

const validParams = ["limit", "type", "user", "challengeId", "buildId", "reviewAction", "reviewer", "cohort"];
const validReviewActions = ["ACCEPTED", "REJECTED"]; // TODO this should be a shared constant
const validTypes = Object.values(EVENT_TYPES);
const validateEventsQueryParams = query => {
  const failingQueries = [];
  Object.entries(query).forEach(([name, values]) => {
    if (!validParams.includes(name)) {
      failingQueries.push([name]);
      return;
    }

    const valuesArray = values.split(",");
    if (name === "type") {
      valuesArray.forEach(value => {
        if (!validTypes.includes(value)) {
          failingQueries.push([name, value]);
        }
      });
    }
    if (name === "reviewAction") {
      valuesArray.forEach(value => {
        if (!validReviewActions.includes(value)) {
          failingQueries.push([name, value]);
        }
      });
    }
  });
  return failingQueries;
};

const queryParamsToConditions = query => {
  const conditions = {};
  Object.entries(query).forEach(([name, values]) => {
    switch (name) {
      case "type": {
        conditions.type = values;
        break;
      }
      case "user": {
        conditions["payload/userAddress"] = values;
        break;
      }
      case "cohort": {
        conditions["payload/streamAddress"] = values;
        break;
      }
      case "challengeId": {
        conditions["payload/challengeId"] = values;
        break;
      }
      case "buildId": {
        conditions["payload/buildId"] = values;
        break;
      }
      case "reviewAction": {
        conditions["payload/reviewAction"] = values;
        break;
      }
      case "reviewer": {
        conditions["payload/reviewerAddress"] = values;
        break;
      }
      default:
      // do nothing
    }
  });
  return conditions;
};

module.exports = {
  EVENT_TYPES,
  createEvent,
  validateEventsQueryParams,
  queryParamsToConditions,
};
