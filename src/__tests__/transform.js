/**
 * @jest-environment jsdom
 */

const {
  tokenize,
  buildAST,
  transformFromAST,
  transform,
} = require("../transform");

it("should return correct nested tokens", () => {
  const sourceCode = `
div
    span
    span
div
`;

  const tokens = tokenize(sourceCode);

  expect(tokens).toEqual([
    {
      type: "Tag",
      value: "div",
      indentLevel: 0,
    },
    {
      type: "Tag",
      value: "span",
      indentLevel: 1,
    },
    {
      type: "Tag",
      value: "span",
      indentLevel: 1,
    },
    {
      type: "Tag",
      value: "div",
      indentLevel: 0,
    },
  ]);
});

it("should build correct nested ast tree from given tokens", () => {
  const tokens = [
    {
      type: "Tag",
      value: "div",
      indentLevel: 0,
    },
    {
      type: "Tag",
      value: "span",
      indentLevel: 1,
    },
    {
      type: "Tag",
      value: "span",
      indentLevel: 1,
    },
    {
      type: "Tag",
      value: "div",
      indentLevel: 0,
    },
  ];

  const ast = buildAST(tokens);

  expect(ast).toEqual([
    {
      type: "Element",
      name: "div",
      children: [
        {
          type: "Element",
          name: "span",
          children: [],
        },
        {
          type: "Element",
          name: "span",
          children: [],
        },
      ],
    },
    {
      type: "Element",
      name: "div",
      children: [],
    },
  ]);
});

it("should create correct html from AST tree", () => {
  const ast = [
    {
      type: "Element",
      name: "div",
      children: [
        {
          type: "Element",
          name: "span",
          children: [],
        },
      ],
    },
    {
      type: "Element",
      name: "div",
      children: [],
    },
  ];

  const html = transformFromAST(ast);

  expect(html).toMatchSnapshot();
});

it("should return single element", () => {
  const sourceCode = "div";

  const output = transform(sourceCode);

  expect(output).toBe("<div></div>");
});

it("should return multiple sibling elements", () => {
  const sourceCode = `
div
div
`;

  const output = transform(sourceCode);

  expect(output).toMatchSnapshot();
});

it("should return nested elements", () => {
  const sourceCode = `
div
    span
`;

  const output = transform(sourceCode);

  expect(output).toMatchSnapshot();
});

it("should pass interview question correctly", () => {
  const sourceCode = `
div
    span
    span
    img
div
    div
        div
    div
`;

  const output = transform(sourceCode);
  expect(output).toMatchSnapshot(sourceCode);
});
