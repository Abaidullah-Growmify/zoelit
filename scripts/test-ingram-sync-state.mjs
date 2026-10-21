import assert from "node:assert/strict";
import { matchesSyncSearch, mergePendingChanges, normalizeSyncSku, removePendingChange, toggleSyncSelection } from "../lib/ingram-sync-state.mjs";

const change = (id, sku, stock) => ({ _id: id, ingramPartNumber: sku, stockChanged: true, oldStock: 0, newStock: stock });

assert.equal(normalizeSyncSku(" 4r70039 "), "4R70039");
assert.equal(matchesSyncSearch({ ingramPartNumber: "4R70039" }, "4r70039"), true);
assert.equal(matchesSyncSearch({ productSnapshot: { name: "USB scanner" } }, "scanner"), true);
assert.equal(matchesSyncSearch({ ingramPartNumber: "PAGE-1" }, "missing"), false);
let selected = toggleSyncSelection(new Set(), "new-1");
selected = toggleSyncSelection(selected, "pending-1");
assert.deepEqual([...selected].sort(), ["new-1", "pending-1"]);
selected = toggleSyncSelection(selected, "new-1");
assert.deepEqual([...selected], ["pending-1"]);

let pending = mergePendingChanges([], [change("p1", "PAGE-1", 10)]);
pending = mergePendingChanges(pending, [
  change("p2", "PAGE-2", 20),
  change("p3", "PAGE-3", 30),
  change("p4", "PAGE-4", 40),
  change("p5", "PAGE-5", 50),
]);
assert.equal(pending.length, 5);

pending = mergePendingChanges(pending, [change("replacement", " page-2 ", 25)]);
assert.equal(pending.length, 5);
assert.equal(pending.find((item) => normalizeSyncSku(item.ingramPartNumber) === "PAGE-2").newStock, 25);

pending = removePendingChange(pending, change("replacement", "PAGE-2", 25));
assert.equal(pending.length, 4);

const secondCategory = mergePendingChanges([], [change("other", "PAGE-1", 99)]);
assert.equal(secondCategory.length, 1);
assert.equal(pending.length, 4, "switching category must not reuse prior category changes");

console.log("Ingram sync UI state tests passed");
