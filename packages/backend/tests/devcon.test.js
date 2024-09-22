const request = require("supertest");
const express = require("express");
const router = require("../routes/devcon");
const db = require("../services/db/db");

jest.mock("../services/db/db");
jest.mock("node-fetch", () => jest.fn());
jest.mock("../utils/sign", () => ({
  verifySignature: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/devcon", router);

const AUGUST_2024 = 1722902399000;
const SEPTEMBER_2024 = 1725580799000;

describe("GET /devcon/check-eligibility/:builderAddress", () => {
  it("should return eligibility for a builder with a batch", async () => {
    const builderAddress = "0xWhatEver";
    db.findUserByAddress.mockResolvedValue({ data: { batch: { number: true }, creationTimestamp: AUGUST_2024 } });

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: true, type: "batch" });
  });

  it("should return not eligible for a builder with a batch after august 2024", async () => {
    const builderAddress = "0xWhatEver";
    db.findUserByAddress.mockResolvedValue({ data: { batch: { number: true }, creationTimestamp: SEPTEMBER_2024 } });

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: false });
  });

  it("should return eligibility for an existing builder", async () => {
    const builderAddress = "0xWhatEver";
    db.findUserByAddress.mockResolvedValue({ exists: true, data: { creationTimestamp: AUGUST_2024 } });

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: true, type: "builder" });
  });

  it("should return not eligible for an existing builder after august 2024", async () => {
    const builderAddress = "0xWhatEver";
    db.findUserByAddress.mockResolvedValue({ exists: true, data: { creationTimestamp: SEPTEMBER_2024 } });

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: false });
  });

  it("should return eligibility for a builder not in BG but in SRE (=> 3 challenges)", async () => {
    const builderAddress = "0x8eE31084d2914fA84Baae3460093564934837898";

    db.findUserByAddress.mockResolvedValue({ exists: false });
    // You can also comment to test the real SRE backend
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            challenges: {
              1: { status: "ACCEPTED", submittedTimestamp: AUGUST_2024 },
              2: { status: "ACCEPTED", submittedTimestamp: AUGUST_2024 },
              3: { status: "ACCEPTED", submittedTimestamp: AUGUST_2024 },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: true, type: "builder" });
  });

  it("should return not eligible for a builder not in BG but in SRE (=> 3 challenges) after august 2024", async () => {
    const builderAddress = "0x1f5D55925050416bA7AeD8848Ddd96b4b2AF2939";

    db.findUserByAddress.mockResolvedValue({ exists: false });
    // You can also comment to test the real SRE backend
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            challenges: {
              1: { status: "ACCEPTED", submittedTimestamp: AUGUST_2024 },
              2: { status: "ACCEPTED", submittedTimestamp: AUGUST_2024 },
              3: { status: "ACCEPTED", submittedTimestamp: SEPTEMBER_2024 },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: false });
  });

  it("should return not elegible for a builder Not In BG but from SRE (< 3 challenges)", async () => {
    const builderAddress = "0x7ea0B38A8c660AA5881b79926dE9d84F636Bb3e3";

    db.findUserByAddress.mockResolvedValue({ exists: false });
    // You can also comment to test the real SRE backend
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ challenges: { 1: {}, 2: {} } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: false });
  });

  it("should return not eligible for a builder not found in BG and SRE", async () => {
    const builderAddress = "0x0000000000000000000000000000000000000000";

    db.findUserByAddress.mockResolvedValue({ exists: false });
    // You can also comment to test the real SRE backend
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await request(app).get(`/devcon/check-eligibility/${builderAddress}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isEligible: false });
  });
});
