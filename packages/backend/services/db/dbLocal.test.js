const log = console.log.bind({}); // get the original console.log to use here for debugging with `log()`
global.log = log;
global.console.log = jest.fn(); // skip server logs

const db = require("./dbLocal");
const { clearDb } = require("../../utils/testingUtils");

beforeEach(() => {
  clearDb(db);
});

describe("The local database", () => {
  it("ToDo Tests.", () => {
    expect(true).toEqual(true);
  });
});
