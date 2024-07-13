// @ts-check

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: ["airbnb-base", "airbnb-typescript/base"],
    parserOptions: {
      project: "./tsconfig.json", // Ensure you have a tsconfig.json file at the root of your project
    },
  },
];
