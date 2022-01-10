const indentSize = 4;

function transform(sourceCode) {
  const tokens = tokenize(sourceCode);
  const ast = buildAST(tokens);

  return transformFromAST(ast);
}

function transformFromAST(ast) {
  const transformedElements = [];

  for (const node of ast) {
    transformedElements.push(transformNode(node));
  }

  return transformedElements.join("");
}

function transformNode(node) {
  if (node.type === "Element") {
    // if we used browser API, no need to check for self closing tag names
    if (node.name === "img") {
      return createSelfClosingTag(node.name);
    }

    let element = createOpeningTag(node.name);

    if (node.children.length) {
      element += transformFromAST(node.children);
    }

    element += createClosingTag(node.name);

    return element;
  }
}

function tokenize(sourceCode) {
  let counter = 0;
  let indentLevel = 0;

  const tokens = [];

  while (counter < sourceCode.length) {
    const char = sourceCode[counter];

    if (isWhitespace(char)) {
      let whitespaceAmount = 1;
      let nextChar = sourceCode[++counter];

      while (isWhitespace(nextChar)) {
        whitespaceAmount++;
        nextChar = sourceCode[++counter];
      }

      if (whitespaceAmount % indentSize !== 0) {
        throw new Error(`Invalid indentation! ${whitespaceAmount}`);
      }

      indentLevel = whitespaceAmount / indentSize;
      continue;
    }

    if (isLetter(char)) {
      let token = {
        type: "Tag",
        value: char,
        indentLevel: indentLevel,
      };

      let nextChar = sourceCode[++counter];
      while (!isNewLineChar(nextChar) && nextChar) {
        token.value += nextChar;
        nextChar = sourceCode[++counter];
      }

      indentLevel = 0;
      tokens.push(token);
      continue;
    }

    counter++;
  }

  return tokens;
}

function buildAST(tokens) {
  const token = tokens[0];
  const tree = [];

  if (!tokens.length) {
    return tree;
  }

  if (token.type === "Tag") {
    tokens.shift(); // remove first element
    const node = {
      type: "Element",
      name: token.value,
      children: [],
    };

    let nextToken = tokens[0];

    const childrenTokens = [];

    while (nextToken && nextToken.indentLevel !== token.indentLevel) {
      childrenTokens.push(nextToken);
      // can probably be done with one shift method.
      tokens.shift();
      nextToken = tokens[0];
    }

    node.children = buildAST(childrenTokens);
    tree.push(node);
  }

  return [...tree, ...buildAST(tokens)];
}

function isNewLineChar(nextChar) {
  return nextChar === "\n";
}

function isWhitespace(char) {
  if (isNewLineChar(char)) {
    return false;
  }

  const whitespaceRegex = /\s+/;

  return whitespaceRegex.test(char);
}

function isLetter(char) {
  if (typeof char !== "string") {
    return false;
  }

  const letterRegex = /[a-zA-Z]/;

  return letterRegex.test(char);
}

function createOpeningTag(name) {
  return `<${name}>`;
}

function createClosingTag(name) {
  return `</${name}>`;
}

function createSelfClosingTag(name) {
  return `<${name} />`;
}

module.exports = {
  transform,
  transformFromAST,
  tokenize,
  buildAST,
};
