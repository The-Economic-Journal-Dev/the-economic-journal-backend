const NodeCache = require("node-cache");
const timersPromises = require("node:timers/promises");
const cache = new NodeCache({ stdTTL: 3600, useClones: false });
const express = require("express");
const app = express();

const testData = [
  { id: "a", body: "1" },
  { id: "b", body: "2" },
  { id: "c", body: "3" },
  { id: "d", body: "4" },
  { id: "e", body: "5" },
  { id: "f", body: "6" },
  { id: "g", body: "7" },
];

const getData = async () => {
  const data = await timersPromises.setTimeout(500, testData);
  return data;
};

const arrayToJson = async (array) => {
  let string = "{";
  await array.forEach((json) => {
    string += `"${json.id}": ${JSON.stringify(json)},`;
  });
  string = string.slice(0, string.length - 1);
  string += "}";
  return await JSON.parse(string);
};

const jsonToArray = async (json) => {
  let array = [];
  JSON.stringify(json, (key, value) => {
    if (typeof value === typeof {} && key !== "") {
      array.push(value);
    }
    return value;
  });
  return array;
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
