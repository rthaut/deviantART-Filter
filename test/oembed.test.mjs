import assert from "node:assert/strict";
import { test } from "node:test";

import { GetOEmbedURL } from "../app/scripts/background/oembed.js";

test("keeps the whole deviation URL in the url parameter", () => {
  const deviationURL =
    "https://www.deviantart.com/someone/art/Title-123?a=1&b=2#comments";

  const url = GetOEmbedURL(deviationURL);

  assert.equal(
    url.origin + url.pathname,
    "https://backend.deviantart.com/oembed",
  );
  assert.equal(url.searchParams.get("url"), deviationURL);
  assert.deepEqual([...url.searchParams.keys()], ["url"]);
  assert.equal(url.hash, "");
});

test("keeps a plus sign in the deviation URL", () => {
  const deviationURL = "https://www.deviantart.com/someone/art/A+B-123";

  assert.equal(
    GetOEmbedURL(deviationURL).searchParams.get("url"),
    deviationURL,
  );
});
