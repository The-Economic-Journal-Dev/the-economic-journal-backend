const NodeCache = require("node-cache");
const timersPromises = require("node:timers/promises");
const cache = new NodeCache({ stdTTL: 3600, useClones: false });
const express = require("express");
const app = express();

function generateTestData(count = 100) {
  const testData = [];
  for (let i = 0; i < count; i++) {
    const id = String.fromCharCode(97 + (i % 26)) + Math.floor(i / 26);
    testData.push({
      id: id,
      body: (i + 1).toString(),
    });
  }
  return testData;
}

const testData = generateTestData();

const getData = async () => {
  const data = await timersPromises.setTimeout(500, testData);
  return data;
};

const arrayToJson = async (array) => {
  return Object.fromEntries(array.map((json) => [json.id, json]));
};

const jsonToArray = async (json) => {
  return Object.values(json);
};

const initCache = async () => {
  let testJson = await cache.get("json");

  if (!testJson) {
    console.log(
      "Cache not found. Making request to db and caching the response",
    );
    testJson = await arrayToJson(await getData());
    cache.set("json", testJson);
  }

  let testArray = await cache.get("array");

  if (!testArray) {
    console.log(
      "Cache not found. Making request to db and caching the response",
    );
    testArray = jsonToArray(testJson);
    cache.set("array", testArray);
  }
};

const appendCache = async (data, options) => {
  // Make it do db calls to update cache (slower, more reliable, but more dependent of db, easier to implemet)
  // Use local data to update cache (faster, less reliable, more complicated to implement, dependant on logic)
};

const getSingle = async (req, res) => {
  await initCache();
  const json = await cache.get("json");
  const result = json[req.params.id];

  res.send(result);
};

const getMultiple = async (req, res) => {
  const { query } = req;
  query.pageNumber = parseInt(query.pageNumber);
  query.count = parseInt(query.count);

  const skipCount = (pageNumber - 1) * count;

  const array = await cache.get("array");

  if (array.length < pageNumber * count) {
    // Make db calls to get more posts and append it to the cache
  }
};

app.get("/:id", getSingle);
app.get("/");

app.listen(3000);
