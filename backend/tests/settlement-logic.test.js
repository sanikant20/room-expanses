import { test, describe, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/utils/ApiError.js";
import { Settlement } from "../src/models/settlement.model.js";
import { Expense } from "../src/models/expense.model.js";
import { Partner } from "../src/models/partner.model.js";
import { Group } from "../src/models/group.model.js";
import { settleScope, revertScope } from "../src/services/settlement.service.js";
import {
  markTransactionPaid,
  confirmTransactionReceipt,
  resetTransactionPayment,
  settleMonth,
  revertSettlement,
  getSettlement,
} from "../src/controllers/settlement.controller.js";

afterEach(() => {
  mock.restoreAll();
});

const captureError = async (handler, req) => {
  let captured;
  await handler(req, {}, (err) => {
    captured = err;
  });
  return captured;
};

const runHandler = async (handler, req) => {
  let statusCode = 0;
  let body = null;
  let error = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };
  await handler(req, res, (err) => { error = err; });
  return { statusCode, body, error };
};

const partnerReq = (from, to) => ({
  userType: "partner",
  user: { _id: from },
  body: { bsYear: 2082, bsMonth: 4, from, to },
});

const partnerActingAs = (userId, from, to) => ({
  userType: "partner",
  user: { _id: userId },
  body: { bsYear: 2082, bsMonth: 4, from, to },
});

const adminReq = (from, to) => ({
  userType: "user",
  user: { _id: "adminId" },
  body: { bsYear: 2082, bsMonth: 4, from, to },
});

describe("settleScope", () => {
  test("returns alreadySettled when a record exists and nothing is left to settle", async () => {
    const existing = { _id: "s1", status: "settled" };
    mock.method(Settlement, "findOne", () => existing);
    mock.method(Expense, "countDocuments", async () => 0);

    const result = await settleScope({ year: 2082, month: 4 });
    assert.equal(result.alreadySettled, true);
    assert.equal(result.record, existing);
  });

  test("recovers from an E11000 race by re-fetching the existing record", async () => {
    const record = { _id: "settlement-1", status: "settled", transactions: [] };
    const populated = (doc) => ({ ...doc, populate: () => doc });

    let findOneCalls = 0;
    const findOneMock = mock.method(Settlement, "findOne", () => {
      findOneCalls += 1;
      return findOneCalls === 1 ? null : populated(record);
    });
    mock.method(Settlement, "findOneAndUpdate", () => {
      throw { code: 11000 };
    });
    mock.method(Expense, "countDocuments", async () => 0);
    mock.method(Expense, "find", async () => []);
    mock.method(Partner, "find", () => ({ sort: async () => [] }));

    const result = await settleScope({ year: 2082, month: 4 });
    assert.equal(result.record._id, "settlement-1");
    assert.equal(result.alreadySettled, false);
    assert.equal(findOneMock.mock.calls.length, 2);
  });
});

describe("markTransactionPaid", () => {
  test("rejects a body without from/to partners", async () => {
    const err = await captureError(markTransactionPaid, {
      userType: "user",
      user: { _id: "admin" },
      body: { bsYear: 2082, bsMonth: 4 },
    });
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 400);
  });

  test("blocks a partner who is not the payer", async () => {
    const err = await captureError(markTransactionPaid, partnerActingAs("someoneElse", "payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 403);
  });

  test("admin can mark any transaction as paid", async () => {
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 1, modifiedCount: 1 }));
    const { statusCode, body } = await runHandler(markTransactionPaid, adminReq("payerA", "receiverB"));
    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
  });

  test("the paying partner can mark their own payment as paid", async () => {
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 1, modifiedCount: 1 }));
    const { statusCode } = await runHandler(markTransactionPaid, partnerReq("payerA", "receiverB"));
    assert.equal(statusCode, 200);
  });

  test("404 when no settled record matches for payment", async () => {
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 0, modifiedCount: 0 }));
    const err = await captureError(markTransactionPaid, adminReq("payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 404);
  });
});

describe("confirmTransactionReceipt", () => {
  test("blocks a partner who is not the receiver", async () => {
    const err = await captureError(confirmTransactionReceipt, partnerActingAs("someoneElse", "payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 403);
  });

  test("404 when no settled record matches", async () => {
    mock.method(Settlement, "findOne", async () => null);
    const err = await captureError(confirmTransactionReceipt, adminReq("payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 404);
  });

  test("409 when the payer has not marked the payment as paid yet", async () => {
    mock.method(Settlement, "findOne", async () => ({
      transactions: [{ from: { _id: "payerA" }, to: { _id: "receiverB" }, paymentStatus: "pending" }],
    }));
    const err = await captureError(confirmTransactionReceipt, adminReq("payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 409);
  });

  test("404 when the transaction pair is missing from the record", async () => {
    mock.method(Settlement, "findOne", async () => ({
      transactions: [{ from: { _id: "someoneElse" }, to: { _id: "otherGuy" }, paymentStatus: "paid" }],
    }));
    const err = await captureError(confirmTransactionReceipt, adminReq("payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 404);
  });

  test("marks the receipt as confirmed when the payment is already paid", async () => {
    mock.method(Settlement, "findOne", async () => ({
      transactions: [{ from: "payerA", to: "receiverB", paymentStatus: "paid" }],
    }));
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 1, modifiedCount: 1 }));
    const { statusCode, body } = await runHandler(confirmTransactionReceipt, adminReq("payerA", "receiverB"));
    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
  });
});

describe("resetTransactionPayment", () => {
  test("resets a transaction back to pending", async () => {
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 1, modifiedCount: 1 }));
    const { statusCode, body } = await runHandler(resetTransactionPayment, adminReq("payerA", "receiverB"));
    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
  });

  test("404 when the settled transaction does not exist for reset", async () => {
    mock.method(Settlement, "updateMany", async () => ({ matchedCount: 0, modifiedCount: 0 }));
    const err = await captureError(resetTransactionPayment, adminReq("payerA", "receiverB"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 404);
  });
});

describe("getSettlement source filter data", () => {
  const settleAction = (source) => ({
    _id: `action-${source}`,
    source,
    settledBy: null,
    settledAt: new Date(),
    transactions: [
      { from: { _id: "payerA", name: "Alice" }, to: { _id: "receiverB", name: "Bob" }, amount: 100 },
    ],
  });

  const populated = (doc) => ({ ...doc, populate: () => doc });

  const mockLookups = ({
    allActions = [],
    primaryActions = [],
    secondaryActions = [],
    allTransactions,
    primaryTransactions = [],
    secondaryTransactions = [],
    noAllRecord = false,
  } = {}) => {
    mock.method(Partner, "find", () => ({ select: () => ({ sort: async () => [] }) }));
    mock.method(Expense, "find", () => ({ select: async () => [] }));
    mock.method(Group, "find", () => ({ sort: async () => [{ _id: "g1" }] }));
    // mongoose queries are .populate()-chainable even when they resolve null
    const nullDoc = () => ({ populate: async () => null });
    mock.method(Settlement, "findOne", (query) => {
      if (query.category === null) {
        return noAllRecord
          ? nullDoc()
          : populated({ _id: "all", status: "settled", transactions: allTransactions || [], settleActions: allActions });
      }
      if (query.category === "primary") return populated({ _id: "primary", status: "settled", transactions: primaryTransactions, settleActions: primaryActions });
      return nullDoc();
    });
    const secondary = [{ _id: "sec1", status: "settled", transactions: secondaryTransactions, settleActions: secondaryActions }];
    mock.method(Settlement, "find", () => ({ populate: () => secondary }));
  };

  test("includes the all-record settleActions in the category=null (all) response", async () => {
    mockLookups({ allActions: [settleAction("auto"), settleAction("manual")] });
    const { statusCode, body } = await runHandler(getSettlement, {
      query: { bsYear: 2083, bsMonth: 4 },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.settlement.settleActions.length, 2);
    assert.deepEqual(body.settlement.settleActions.map((a) => a.source).sort(), ["auto", "manual"]);
  });

  test("source filter has data even when primary/secondary records carry no settleActions", async () => {
    mockLookups({ allActions: [settleAction("auto")] });
    const { body } = await runHandler(getSettlement, {
      query: { bsYear: 2083, bsMonth: 4 },
    });
    assert.equal(body.settlement.settleActions.length, 1);
    assert.equal(body.settlement.settleActions[0].source, "auto");
    assert.equal(body.settlement.settleActions[0].transactions[0].from.name, "Alice");
  });

  test("uses the combined record's transactions for the All scope when it exists (bug #22)", async () => {
    // Combined netting differs from per-scope netting: this pair exists ONLY
    // in the all-record, and its payment status was marked paid there.
    mockLookups({
      allTransactions: [
        { from: { _id: "payerC" }, to: { _id: "receiverD" }, amount: 683.8, paymentStatus: "paid" },
      ],
      primaryTransactions: [{ from: { _id: "x" }, to: { _id: "y" }, amount: 1 }],
      secondaryTransactions: [{ from: { _id: "z" }, to: { _id: "w" }, amount: 2 }],
    });
    const { body } = await runHandler(getSettlement, {
      query: { bsYear: 2083, bsMonth: 4 },
    });
    assert.equal(body.settlement.transactions.length, 1);
    assert.equal(body.settlement.transactions[0].paymentStatus, "paid");
    assert.equal(String(body.settlement.transactions[0].from._id), "payerC");
  });

  test("falls back to stitched primary + secondary transactions without a combined record", async () => {
    mockLookups({
      noAllRecord: true,
      primaryTransactions: [{ from: { _id: "x" }, to: { _id: "y" }, amount: 1 }],
      secondaryTransactions: [{ from: { _id: "z" }, to: { _id: "w" }, amount: 2 }],
    });
    const { body } = await runHandler(getSettlement, {
      query: { bsYear: 2083, bsMonth: 4 },
    });
    assert.equal(body.settlement.transactions.length, 2);
  });
});

describe("settleMonth / revertSettlement guards", () => {
  test("settleMonth requires bsYear and bsMonth", async () => {
    const err = await captureError(settleMonth, { body: {} });
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 400);
  });

  test("settleMonth settles all secondary groups when no group specified", async () => {
    mock.method(Group, "find", () => ({ sort: async () => [{ _id: "group1" }, { _id: "group2" }] }));
    mock.method(Partner, "find", () => ({ sort: async () => [] }));
    const err = await captureError(settleMonth, {
      user: { _id: "admin" },
      body: { bsYear: 2082, bsMonth: 4, category: "secondary" },
    });
    assert.ok(!(err instanceof ApiError) || err.statusCode !== 400, "Should not reject secondary without group");
  });

  test("settleMonth errors when no secondary groups exist", async () => {
    mock.method(Group, "find", () => ({ sort: async () => [] }));
    mock.method(Partner, "find", () => ({ sort: async () => [] }));
    const err = await captureError(settleMonth, {
      user: { _id: "admin" },
      body: { bsYear: 2082, bsMonth: 4, category: "secondary" },
    });
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 400);
  });

  test("revertSettlement requires bsYear and bsMonth", async () => {
    const err = await captureError(revertSettlement, { body: {} });
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 400);
  });

  test("revertSettlement reverts all secondary groups when no group specified", async () => {
    mock.method(Settlement, "distinct", async () => ["group1"]);
    const err = await captureError(revertSettlement, {
      body: { bsYear: 2082, bsMonth: 4, category: "secondary" },
    });
    assert.ok(!(err instanceof ApiError) || err.statusCode !== 400, "Should not reject secondary revert without group");
  });

  test("settleMonth rejects re-settling an already-settled all scope", async () => {
    mock.method(Settlement, "findOne", async () => ({ status: "settled" }));
    const err = await captureError(settleMonth, { user: { _id: "admin" }, body: { bsYear: 2082, bsMonth: 4 } });
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 409);
  });
});
