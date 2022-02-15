// TODO PR: how do we keep just one instance of this enum? Like a commons library
const EVENT_TYPES = {
  CHALLENGE_SUBMIT: "challenge.submit",
  CHALLENGE_REVIEW: "challenge.review",
  CHALLENGE_AUTOGRADE: "challenge.autograde",
  BUILD_SUBMIT: "build.submit",
  BUILD_DELETE: "build.delete",
  BUILD_FEATURED: "build.featured",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_UPDATE_STATUS: "user.update_status",
};

export const eventDisplay = ({ type, payload }) => {
  switch (type) {
    case EVENT_TYPES.CHALLENGE_SUBMIT: {
      return `submitted a solution for ${payload.challengeId}`;
    }

    case EVENT_TYPES.CHALLENGE_REVIEW: {
      return `The submitted ${payload.challengeId} challenge has been ${payload.reviewAction.toLowerCase()}`;
    }

    case EVENT_TYPES.CHALLENGE_AUTOGRADE: {
      return `The submitted "${
        payload.challengeId
      }" challenge has been ${payload.reviewAction.toLowerCase()} (autograded)`;
    }

    case EVENT_TYPES.BUILD_SUBMIT: {
      return `just submitted a new build: "${payload.name}"`;
    }

    case EVENT_TYPES.BUILD_DELETE: {
      return `just deleted their build "${payload.name}"`;
    }

    case EVENT_TYPES.BUILD_FEATURED: {
      return `Their build "${payload.name ?? ""}" has been ${payload.featured ? "featured" : "unfeatured"}`;
    }

    case EVENT_TYPES.USER_CREATE: {
      return `just created a builder account. Welcome!`;
    }

    case EVENT_TYPES.USER_UPDATE_STATUS: {
      return `updated their status: "${payload.text}"`;
    }

    // ToDo. Build events. Wait until we tackled issue #134
    // https://github.com/moonshotcollective/scaffold-directory/issues/134

    default:
      // do nothing
      return "";
  }
};
