function areArraysEqual(arr1, arr2) {
  if (
    arr1.length === arr2.length &&
    arr1.every((u, i) => {
      return u === arr2[i];
    })
  ) {
    return true;
  }

  return false;
}

module.exports = {
  areArraysEqual,
};
