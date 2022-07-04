export const byTimestamp = (a, b) => a.timestamp - b.timestamp;

export const bySubmittedTimestamp = (a, b) => a.submittedTimestamp - b.submittedTimestamp;

export const byBigNumber = (a, b) => {
  if (a.eq(b)) {
    return 0;
  }
  return a.gt(b) ? 1 : -1;
};
