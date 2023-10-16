function isUserEligibleForNotification(userData, notification) {
  const criteria = notification.criteria;

  const userJoinedDate = new Date(userData.creationTimestamp);
  const currentDate = new Date();

  const daysDifference = (currentDate - userJoinedDate) / (1000 * 60 * 60 * 24);

  // Check if user satisfies the daysJoinedBefore criteria
  if (criteria.daysJoinedBefore && daysDifference < criteria.daysJoinedBefore) {
    return false;
  }

  // Check if user satisfies the daysJoinedAfter criteria
  if (criteria.daysJoinedAfter && daysDifference > criteria.daysJoinedAfter) {
    return false;
  }

  // Check if user satisfies the minBuilds criteria
  if (criteria.minBuilds && userData.builds.length < criteria.minBuilds) {
    return false;
  }

  // Check if user has a stream
  if (criteria.hasStream && !userData.stream) {
    return false;
  }

  return true;
}

module.exports = {
  isUserEligibleForNotification,
};
