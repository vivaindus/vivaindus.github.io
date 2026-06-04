export function splitTopLevelArguments(text) {
  return splitTopLevelByChar(text, ',');
}

function splitTopLevelByChar(text, separator) {
  const parts = [];
  let current = '';
  let depth = 0;
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      inString = !inString;
      current += char;
      continue;
    }

    if (!inString && char === '(') depth++;
    if (!inString && char === ')') depth--;

    if (!inString && char === separator && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim() || text.endsWith(separator)) {
    parts.push(current.trim());
  }

  return parts;
}

export function splitTopLevelByAmpersand(text) {
  return splitTopLevelByChar(text, '&');
}

export function parseFunctionCall(expression) {
  const clean = String(expression || '').trim().replace(/^=/, '');
  const nameMatch = clean.match(/^([A-Z][A-Z0-9_.]*)\s*\(/i);

  if (!nameMatch) return null;

  const name = nameMatch[1].toUpperCase();
  const openIndex = clean.indexOf('(');
  const closeIndex = findMatchingCloseParen(clean, openIndex);

  // Only parse as a function if the closing bracket ends the full expression.
  // This prevents IF(...)&":"&IF(...) from being treated as one IF.
  if (closeIndex === -1 || closeIndex !== clean.length - 1) {
    return null;
  }

  const inside = clean.slice(openIndex + 1, closeIndex);

  return {
    name,
    args: splitTopLevelArguments(inside)
  };
}

function findMatchingCloseParen(text, openIndex) {
  let depth = 0;
  let inString = false;

  for (let i = openIndex; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '(') depth++;
    if (char === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function getContext(formula) {
  const firstRef = String(formula || '').match(/\$?[A-Z]{1,3}\$?(\d+)/i);
  return {
    formula: String(formula || ''),
    currentRow: firstRef ? firstRef[1] : 'current row',
    seenBlocks: new Set()
  };
}

function getRowFromReference(ref) {
  return String(ref || '').match(/\d+/)?.[0] || '';
}

export function explainExpression(expression, role = '', ctx = {}) {
  const clean = String(expression || '').trim();

  if (!clean) {
    return `Blank argument = This argument is empty.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+<>""$/i.test(clean)) {
    const ref = clean.replace(/<>""/i, '');
    return `${clean} = Logical test: Checks whether ${ref} is not blank. <> means not equal to, and "" means blank. If ${ref} has data, it returns TRUE. If ${ref} is blank, it returns FALSE.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+=""$/i.test(clean)) {
    const ref = clean.replace(/=""/i, '');
    return `${clean} = Logical test: Checks whether ${ref} is blank. If ${ref} is empty, it returns TRUE. If ${ref} has data, it returns FALSE.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+>0$/i.test(clean)) {
    const ref = clean.replace(/>0/i, '');
    return `${clean} = Logical test: Checks whether ${ref} is greater than zero. If ${ref} is above 0, it returns TRUE. If ${ref} is 0, blank, or less than 0, it returns FALSE.`;
  }

  if (/^FALSE$/i.test(clean) && role === 'range_lookup') {
    return `${clean} = Exact match: Tells VLOOKUP to find an exact match only. If an exact match is not found, VLOOKUP returns an error.`;
  }

  if (/^TRUE$/i.test(clean) && role === 'range_lookup') {
    return `${clean} = Approximate match: Tells VLOOKUP to allow an approximate match. The first column should normally be sorted for this option.`;
  }

  if (/^\d+$/.test(clean) && role === 'col_index_num') {
    return `${clean} = Column index number: Specifies which column value to return from the selected table range. ${clean} means return the value from column number ${clean} of the table.`;
  }

  if (/^"[^"]*"$/.test(clean)) {
    if (clean === '""') {
      if (role === 'value_if_false') {
        return `${clean} = Blank text: This returns blank when the IF condition is FALSE. In this formula pattern, a blank value inside the first inner IF means no start reference is created from the current row. When that blank is joined with ":" and the end reference, the generated text may become invalid, such as ":G2815". If INDIRECT cannot convert that text into a valid range, IFERROR returns the fallback expression. In the outer IF, blank text simply returns an empty result when the main row cell is blank.`;
      }
      return `${clean} = Blank text: This returns blank. It is often used to keep the result cell empty when a condition is not met.`;
    }

    return `${clean} = Text value: This exact text is returned or used by the surrounding function.`;
  }

  if (/^[A-Z0-9_]+!\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+$/i.test(clean)) {
    return `${clean} = Table array/range reference: This points to a range on another sheet. The $ signs lock the row or column references when the formula is copied.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+$/i.test(clean)) {
    if (role === 'value_if_false' || role === 'value_if_error') {
      return `${clean} = Helper/end-reference cell: Excel uses the value from ${clean} as a fallback or end reference. It is likely used to carry the group-ending reference from another row, but the exact value depends on the worksheet setup.`;
    }
    return `${clean} = Cell reference: Excel uses the value from this cell in the surrounding function.`;
  }

  return `${clean} = Argument: This value or expression is used by the surrounding function.`;
}

export function buildDetailedExplanation(formula) {
  const ctx = getContext(formula);
  const root = parseFunctionCall(formula);
  const pattern = detectFormulaPattern(formula);

  if (!root) {
    return {
      overall: pattern?.overall || 'This formula does not start with a supported function pattern yet.',
      pattern,
      items: [explainExpression(formula, '', ctx)]
    };
  }

  const items = [];
  explainFunctionNode(root, items, ctx);

  return {
    overall: pattern?.overall || buildOverallMeaning(root, formula),
    pattern,
    items
  };
}

function detectFormulaPattern(formula) {
  const root = parseFunctionCall(formula);
  if (!root || root.name !== 'IF' || root.args.length < 3) return null;

  const [mainCondition, truePart, falsePart] = root.args;
  if (!/^\$?[A-Z]{1,3}\$?\d+<>""$/i.test(mainCondition)) return null;

  const currentRef = mainCondition.replace(/<>""/i, '');
  const currentRow = getRowFromReference(currentRef);

  const trueNode = parseFunctionCall(truePart);
  if (!trueNode || trueNode.name !== 'IFERROR') return null;

  const [mainCalc, fallback] = trueNode.args;
  const sumNode = parseFunctionCall(mainCalc);
  if (!sumNode || sumNode.name !== 'SUM') return null;

  const indirectNode = parseFunctionCall(sumNode.args[0]);
  if (!indirectNode || indirectNode.name !== 'INDIRECT') return null;

  const indirectText = indirectNode.args[0] || '';
  const joinParts = splitTopLevelByAmpersand(indirectText);
  if (!joinParts.includes('":"')) return null;

  const startExpr = joinParts[0] || '';
  const endExpr = joinParts[joinParts.length - 1] || '';

  const startIf = parseFunctionCall(startExpr);
  const endIf = parseFunctionCall(endExpr);
  const fallbackIf = parseFunctionCall(fallback);

  if (!startIf || startIf.name !== 'IF') return null;
  if (!endIf || endIf.name !== 'IF') return null;

  const startCondition = startIf.args[0] || '';
  const startTrue = startIf.args[1] || '';
  const startFalse = startIf.args[2] || '';

  const endCondition = endIf.args[0] || '';
  const endTrue = endIf.args[1] || '';
  const endFalse = endIf.args[2] || '';

  const col = startTrue.match(/^"([A-Z]+)"/i)?.[1] || endTrue.match(/^"([A-Z]+)"/i)?.[1] || 'G';
  const helperRef = /^\$?[A-Z]{1,3}\$?\d+$/i.test(endFalse) ? endFalse : '';

  const previousRef = startCondition.match(/,\s*(\$?[A-Z]{1,3}\$?\d+)=""\s*\)?$/i)?.[1] || '';
  const nextRef = endCondition.match(/,\s*(\$?[A-Z]{1,3}\$?\d+)=""\s*\)?$/i)?.[1] || '';

  return {
    name: 'Dynamic grouped range total',
    summary: `This formula appears to calculate a grouped/block total from column ${col}. It uses ${currentRef} to check whether the current row has data, uses the previous-row check to identify the start of a group, uses the next-row check to identify the end of a group, and uses ${helperRef || 'a helper reference'} when the end reference is carried from another row.`,
    overall: `Overall meaning: This formula checks whether ${currentRef} is not blank. If ${currentRef} has data, the formula tries to calculate a grouped total from column ${col}. It uses column A to detect whether the current row is the start of a group, inside a group, or the end of a group. It builds a dynamic range like "${col}${currentRow}:${col}${Number(currentRow) + 4}", converts that text into a real range using INDIRECT, and then SUM adds the values in that range. If the generated range is invalid, IFERROR returns a fallback reference/value instead. If ${currentRef} is blank, the formula returns blank.`,
    points: [
      `Main row check: ${currentRef}<>"" means the formula only runs when ${currentRef} has data.`,
      previousRef
        ? `Start reference logic: ${startExpr} checks whether ${currentRef} is not blank and ${previousRef} is blank. If TRUE, the current row is likely the first row of a group, so ${startTrue} creates "${col}${currentRow}". If FALSE, it returns blank, meaning this row does not create the start reference. The formula then relies on the fallback/helper-reference logic if the generated range is invalid.`
        : `Start reference logic: ${startExpr} decides whether to create the start reference for the dynamic range.`,
      nextRef
        ? `End reference logic: ${endExpr} checks whether ${currentRef} is not blank and ${nextRef} is blank. If TRUE, the current row is likely the last row of a group, so ${endTrue} creates "${col}${currentRow}". If FALSE, it means the next row also has data, so the current row is likely inside the group and the formula uses ${helperRef || endFalse} to get the end reference from a later row.`
        : `End reference logic: ${endExpr} decides the end reference for the dynamic range.`,
      `Range joining: &":"& joins the start reference and end reference. If the start reference is "${col}${currentRow}" and the end reference is "${col}${Number(currentRow) + 4}", it creates "${col}${currentRow}:${col}${Number(currentRow) + 4}". If the start reference is blank and the end reference is "${col}${Number(currentRow) + 4}", the generated text may become ":${col}${Number(currentRow) + 4}", which may be invalid for INDIRECT.`,
      `SUM + INDIRECT: INDIRECT converts the generated text range into a real Excel range. SUM then adds the numbers in that range. This works only when the generated text is a valid range.`,
      `IFERROR purpose: IFERROR is important here because the dynamic reference may sometimes be invalid, especially when the start reference is blank. If SUM(INDIRECT(...)) works, the formula returns a numeric grouped total. If it fails, IFERROR returns the fallback expression instead, which may be a reference text such as "${col}${currentRow}" or the value from ${helperRef || 'the helper cell'}.`,
      helperRef
        ? `${helperRef} = Helper/end-reference cell: ${helperRef} is likely used to carry the group-ending reference from the next row. For example, it may contain a text reference such as "${col}${Number(currentRow) + 4}". If the current row is not the end of the group, the formula uses ${helperRef} as the end reference.`
        : `Helper reference: the formula appears to use a helper value when the current row is not the last row of the group.`,
      fallbackIf
        ? `Repeated fallback logic: ${fallback} is used again as the IFERROR fallback. If the current row is the last row of the group, it returns "${col}${currentRow}". Otherwise, it returns ${helperRef || endFalse}.`
        : `Fallback logic: ${fallback} is returned when the dynamic SUM/INDIRECT calculation fails.`,
      `Example behavior: If ${currentRef} has data, ${previousRef || 'the previous row'} is blank, and ${nextRef || 'the next row'} is blank, this row is both the start and end of a one-row group, so the formula can create "${col}${currentRow}:${col}${currentRow}". If ${currentRef} has data and ${nextRef || 'the next row'} also has data, this row is inside or at the start of a multi-row group, so the end reference may come from ${helperRef || 'a helper cell'}. If the start reference becomes blank, the generated range may be invalid and IFERROR may return the fallback reference/value.`,
      falsePart === '""'
        ? `Blank return: the outer IF returns blank when ${currentRef} is blank.`
        : `False result: when the main condition is FALSE, the formula returns ${falsePart}.`
    ]
  };
}

function explainFunctionNode(node, items, ctx) {
  if (!node) return;

  if (node.name === 'IF') {
    const [logicalTest, valueIfTrue, valueIfFalse] = node.args;

    items.push(`IF = Logical: Specifies a logical test to perform. In this formula, it checks whether ${logicalTest} returns TRUE or FALSE. If TRUE, it returns ${valueIfTrue}. If FALSE, it returns ${valueIfFalse}.`);

    explainNestedOrExpression(logicalTest, items, 'logical_test', ctx);
    explainNestedOrExpression(valueIfTrue, items, 'value_if_true', ctx);
    explainNestedOrExpression(valueIfFalse, items, 'value_if_false', ctx);
    return;
  }

  if (node.name === 'AND') {
    items.push(`AND = Logical: Returns TRUE only if all its arguments are TRUE. In this formula, it checks ${node.args.join(' and ')}.`);
    node.args.forEach(arg => explainNestedOrExpression(arg, items, 'logical_test', ctx));
    return;
  }

  if (node.name === 'OR') {
    items.push(`OR = Logical: Returns TRUE if at least one argument is TRUE. In this formula, it checks ${node.args.join(' or ')}.`);
    node.args.forEach(arg => explainNestedOrExpression(arg, items, 'logical_test', ctx));
    return;
  }

  if (node.name === 'IFERROR') {
    const [value, fallback] = node.args;

    if (String(value).toUpperCase().includes('SUM(INDIRECT')) {
      items.push(`IFERROR = Error handling: In this formula, IFERROR is important because the dynamic reference created for INDIRECT may sometimes be invalid. If ${value} works, the formula returns the grouped total. If INDIRECT or SUM causes an error, for example when the generated text range is invalid, IFERROR returns the fallback expression ${fallback} instead. This fallback may be a reference text or helper value rather than a numeric total.`);
    } else {
      items.push(`IFERROR = Error handling: Tries to calculate ${value}. If that returns an error, it returns ${fallback} instead.`);
    }

    explainNestedOrExpression(value, items, 'value', ctx);
    explainNestedOrExpression(fallback, items, 'value_if_error', ctx);
    return;
  }

  if (node.name === 'VLOOKUP') {
    const [lookupValue, tableArray, colIndex, rangeLookup] = node.args;

    items.push(`VLOOKUP = Lookup & Reference: Searches for a value in the first column of a selected table and returns a value from another column in the same row. In this formula, it searches ${lookupValue} inside ${tableArray} and returns the value from column ${colIndex}.`);
    items.push(explainExpression(lookupValue, 'lookup_value', ctx).replace('Cell reference:', 'Lookup value:'));
    items.push(explainExpression(tableArray, 'table_array', ctx).replace('Table array/range reference:', 'Table array:'));
    items.push(explainExpression(colIndex, 'col_index_num', ctx));
    items.push(explainExpression(rangeLookup, 'range_lookup', ctx));
    return;
  }

  if (node.name === 'SUM') {
    items.push(`SUM = Math: Adds the values inside the SUM function. In this formula, it adds the value or range returned by ${node.args.join(', ')}.`);
    node.args.forEach(arg => explainNestedOrExpression(arg, items, 'number', ctx));
    return;
  }

  if (node.name === 'INDIRECT') {
    items.push(`INDIRECT = Lookup & Reference: Converts text into a real cell or range reference. In this formula, it converts ${node.args[0]} into a usable Excel reference.`);
    node.args.forEach(arg => explainNestedOrExpression(arg, items, 'ref_text', ctx));
    return;
  }

  if (node.name === 'ROW') {
    if (node.args.length) {
      const ref = node.args[0];
      const row = getRowFromReference(ref);
      items.push(`ROW = Lookup & Reference: Returns a row number. In this formula, ROW(${ref}) returns ${row || `the row number of ${ref}`}.`);
    } else {
      items.push(`ROW = Lookup & Reference: Returns a row number. In this formula, ROW() returns the current row number. If the formula is in row ${ctx.currentRow}, ROW() returns ${ctx.currentRow}.`);
    }
    return;
  }

  items.push(`${node.name} = Function: This function is used with arguments ${node.args.join(', ')}.`);
  node.args.forEach(arg => explainNestedOrExpression(arg, items, '', ctx));
}

function explainNestedOrExpression(expression, items, role = '', ctx = {}) {
  if (!expression) return;

  const nested = parseFunctionCall(expression);

  if (nested) {
    const normalized = normalizeExpression(expression);

    if (ctx.seenBlocks?.has(normalized)) {
      items.push(buildRepeatedBlockExplanation(nested, expression, ctx));
      return;
    }

    ctx.seenBlocks?.add(normalized);
    explainFunctionNode(nested, items, ctx);
    return;
  }

  if (hasTopLevelAmpersand(expression)) {
    explainTextJoinExpression(expression, items, ctx);
    return;
  }

  items.push(explainExpression(expression, role, ctx));
}

function normalizeExpression(expression) {
  return String(expression || '')
    .replace(/^=/, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

function buildRepeatedBlockExplanation(node, expression, ctx) {
  if (node.name === 'IF') {
    const [logicalTest, valueIfTrue, valueIfFalse] = node.args;
    const conditionText = describeCondition(logicalTest);
    return `Repeated IF block: This same IF expression is used again as the IFERROR fallback: ${expression}. It checks ${conditionText}. If TRUE, it returns ${describeShortValue(valueIfTrue, ctx)}. If FALSE, it returns ${describeShortValue(valueIfFalse, ctx)}.`;
  }

  if (node.name === 'AND') {
    return `Repeated AND block: This same AND condition is used again: ${expression}. It checks whether all listed conditions are TRUE.`;
  }

  return `Repeated ${node.name} block: This same expression is used again: ${expression}. The full explanation was already shown above.`;
}

function describeCondition(condition) {
  const nested = parseFunctionCall(condition);

  if (nested?.name === 'AND') {
    return nested.args.map(arg => {
      if (/^\$?[A-Z]{1,3}\$?\d+<>""$/i.test(arg)) {
        const ref = arg.replace(/<>""/i, '');
        return `${ref} is not blank`;
      }

      if (/^\$?[A-Z]{1,3}\$?\d+=""$/i.test(arg)) {
        const ref = arg.replace(/=""/i, '');
        return `${ref} is blank`;
      }

      return arg;
    }).join(' and ');
  }

  if (/^\$?[A-Z]{1,3}\$?\d+<>""$/i.test(condition)) {
    const ref = condition.replace(/<>""/i, '');
    return `${ref} is not blank`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+=""$/i.test(condition)) {
    const ref = condition.replace(/=""/i, '');
    return `${ref} is blank`;
  }

  return `whether ${condition} is TRUE`;
}

function describeShortValue(value, ctx) {
  const clean = String(value || '').trim();

  if (/^"[A-Z]+"\s*&\s*ROW\(\)$/i.test(clean)) {
    const col = clean.match(/^"([A-Z]+)"/i)?.[1] || '';
    return `"${col}${ctx.currentRow}"`;
  }

  if (/^"[A-Z]+"\s*&\s*ROW\(\s*\$?[A-Z]{1,3}\$?\d+\s*\)$/i.test(clean)) {
    const col = clean.match(/^"([A-Z]+)"/i)?.[1] || '';
    const ref = clean.match(/\$?[A-Z]{1,3}\$?\d+/i)?.[0] || '';
    const row = getRowFromReference(ref);
    return `"${col}${row}"`;
  }

  if (clean === '""') return 'blank';
  return clean;
}

function hasTopLevelAmpersand(expression) {
  return splitTopLevelByAmpersand(expression).length > 1;
}

function explainTextJoinExpression(expression, items, ctx) {
  const clean = String(expression || '').trim();

  // Specific pattern first: "G"&ROW()
  if (/^"[A-Z]+"\s*&\s*ROW\(\)$/i.test(clean)) {
    const col = clean.match(/^"([A-Z]+)"/i)?.[1] || '';
    items.push(`${clean} = Text joining: "${col}" is the column letter ${col}. ROW() returns the current row number. If the formula is in row ${ctx.currentRow}, this creates "${col}${ctx.currentRow}".`);
    return;
  }

  // Specific pattern first: "G"&ROW(A2809)
  if (/^"[A-Z]+"\s*&\s*ROW\(\s*\$?[A-Z]{1,3}\$?\d+\s*\)$/i.test(clean)) {
    const col = clean.match(/^"([A-Z]+)"/i)?.[1] || '';
    const ref = clean.match(/\$?[A-Z]{1,3}\$?\d+/i)?.[0] || '';
    const row = getRowFromReference(ref);
    items.push(`${clean} = Text joining: "${col}" is the column letter ${col}. ROW(${ref}) returns ${row}. Together, this creates "${col}${row}".`);
    return;
  }

  const parts = splitTopLevelByAmpersand(clean);

  if (parts.includes('":"')) {
    items.push(`&":"& = Text joining: The & symbol joins text values together. ":" is Excel’s range separator. This joins the start reference and end reference to create range text. The start reference can be "G${ctx.currentRow}" or blank, and the end reference can be "G${ctx.currentRow}" or the value from the helper cell. This can create a valid range like "G${ctx.currentRow}:G2815", or an invalid reference that IFERROR handles.`);
  } else {
    items.push(`${clean} = Text joining: Uses & to join text pieces together.`);
  }

  parts.forEach(part => {
    if (part === '":"') return;
    explainNestedOrExpression(part, items, '', ctx);
  });
}

function buildOverallMeaning(root, formula) {
  const upperFormula = String(formula || '').toUpperCase();
  const ctx = getContext(formula);

  if (
    root.name === 'IF' &&
    upperFormula.includes('INDIRECT') &&
    upperFormula.includes('SUM') &&
    upperFormula.includes('&":"&')
  ) {
    return `Overall meaning: This formula checks whether the main row cell is not blank. If it has data, the formula tries to identify a start reference and an end reference, create a dynamic range in column G, and sum that range. INDIRECT converts the generated text range into a real Excel range. If that calculation causes an error, IFERROR returns the fallback reference or value. If the main row cell is blank, the formula returns blank.`;
  }

  if (root.name === 'IF') {
    return 'Overall meaning: This formula checks a condition first. If the condition is TRUE, it returns the true-result calculation. If the condition is FALSE, it returns the false-result value.';
  }

  if (root.name === 'VLOOKUP') {
    return 'Overall meaning: This formula searches for a lookup value in a table and returns a related value from another column.';
  }

  if (root.name === 'IFERROR') {
    return 'Overall meaning: This formula tries a calculation and returns a fallback result if an error occurs.';
  }

  return `Overall meaning: This formula uses ${root.name} as the main function and calculates a result from its arguments.`;
}
