export const EXCEL_FUNCTIONS = {
  IF: {
    category: 'Logical',
    syntax: 'IF(logical_test, value_if_true, value_if_false)',
    description: 'Checks a condition and returns one result if the condition is TRUE and another result if the condition is FALSE.',
    args: [
      'logical_test: The condition to check.',
      'value_if_true: The result returned when the condition is TRUE.',
      'value_if_false: The result returned when the condition is FALSE.'
    ]
  },
  IFERROR: {
    category: 'Logical',
    syntax: 'IFERROR(value, value_if_error)',
    description: 'Returns the main result if there is no error, otherwise returns a fallback value.',
    args: [
      'value: The calculation or expression to try first.',
      'value_if_error: The result returned if the main value causes an error.'
    ]
  },
  AND: {
    category: 'Logical',
    syntax: 'AND(logical1, [logical2], ...)',
    description: 'Returns TRUE only when all supplied conditions are TRUE.',
    args: [
      'logical1: The first condition to test.',
      'logical2: Additional optional conditions to test.'
    ]
  },
  OR: {
    category: 'Logical',
    syntax: 'OR(logical1, [logical2], ...)',
    description: 'Returns TRUE when at least one supplied condition is TRUE.',
    args: [
      'logical1: The first condition to test.',
      'logical2: Additional optional conditions to test.'
    ]
  },
  SUM: {
    category: 'Math and Trigonometry',
    syntax: 'SUM(number1, [number2], ...)',
    description: 'Adds numbers, cell references, or ranges together.',
    args: [
      'number1: The first number, cell, or range to add.',
      'number2: Additional optional numbers, cells, or ranges to add.'
    ]
  },
  SUMIF: {
    category: 'Math and Trigonometry',
    syntax: 'SUMIF(range, criteria, [sum_range])',
    description: 'Adds values that meet one condition.',
    args: [
      'range: The cells to test against the condition.',
      'criteria: The condition to match.',
      'sum_range: The cells to add if different from the tested range.'
    ]
  },
  SUMIFS: {
    category: 'Math and Trigonometry',
    syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2], [criteria2], ...)',
    description: 'Adds values that meet multiple conditions.',
    args: [
      'sum_range: The cells to add.',
      'criteria_range1: The first range to test.',
      'criteria1: The first condition.',
      'criteria_range2: Additional optional ranges to test.',
      'criteria2: Additional optional conditions.'
    ]
  },
  VLOOKUP: {
    category: 'Lookup and Reference',
    syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    description: 'Searches for a value in the first column of a table and returns a value from another column.',
    args: [
      'lookup_value: The value to search for.',
      'table_array: The table or range to search in.',
      'col_index_num: The column number to return from.',
      'range_lookup: TRUE for approximate match or FALSE for exact match.'
    ]
  },
  XLOOKUP: {
    category: 'Lookup and Reference',
    syntax: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    description: 'Searches a range for a value and returns a matching result from another range.',
    args: [
      'lookup_value: The value to search for.',
      'lookup_array: The range to search.',
      'return_array: The range to return a result from.',
      'if_not_found: Optional result if no match is found.',
      'match_mode: Optional match behavior.',
      'search_mode: Optional search direction.'
    ]
  },
  INDEX: {
    category: 'Lookup and Reference',
    syntax: 'INDEX(array, row_num, [column_num])',
    description: 'Returns a value from a specific position in a range or array.',
    args: [
      'array: The range or array to return from.',
      'row_num: The row position.',
      'column_num: Optional column position.'
    ]
  },
  MATCH: {
    category: 'Lookup and Reference',
    syntax: 'MATCH(lookup_value, lookup_array, [match_type])',
    description: 'Returns the position of a value within a range.',
    args: [
      'lookup_value: The value to find.',
      'lookup_array: The range to search.',
      'match_type: Optional match behavior.'
    ]
  },
  INDIRECT: {
    category: 'Lookup and Reference',
    syntax: 'INDIRECT(ref_text, [a1])',
    description: 'Converts a text reference into an actual cell or range reference.',
    args: [
      'ref_text: Text that represents a cell or range reference.',
      'a1: Optional reference style setting.'
    ]
  },
  ROW: {
    category: 'Lookup and Reference',
    syntax: 'ROW([reference])',
    description: 'Returns the row number of a reference, or the current row if no reference is supplied.',
    args: [
      'reference: Optional cell or range whose row number should be returned.'
    ]
  }
};


export const COMMON_EXCEL_FUNCTIONS_BATCH_1 = {
  IFS: { category: 'Logical', syntax: 'IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)', description: 'Checks multiple conditions and returns the result for the first TRUE condition.', args: ['logical_test1: First condition to test.', 'value_if_true1: Result returned if the first condition is TRUE.', 'logical_test2/value_if_true2: Additional condition-result pairs.'] },
  SWITCH: { category: 'Logical', syntax: 'SWITCH(expression, value1, result1, [default_or_value2], [result2], ...)', description: 'Compares one expression against a list of values and returns the matching result.', args: ['expression: The value to compare.', 'value1: First value to match.', 'result1: Result returned for the first match.', 'default: Optional fallback if nothing matches.'] },
  NOT: { category: 'Logical', syntax: 'NOT(logical)', description: 'Reverses TRUE to FALSE or FALSE to TRUE.', args: ['logical: The value or condition to reverse.'] },
  TRUE: { category: 'Logical', syntax: 'TRUE()', description: 'Returns the logical value TRUE.', args: [] },
  FALSE: { category: 'Logical', syntax: 'FALSE()', description: 'Returns the logical value FALSE.', args: [] },
  XOR: { category: 'Logical', syntax: 'XOR(logical1, [logical2], ...)', description: 'Returns TRUE when an odd number of supplied conditions are TRUE.', args: ['logical1: First condition.', 'logical2: Additional optional conditions.'] },

  AVERAGE: { category: 'Statistical', syntax: 'AVERAGE(number1, [number2], ...)', description: 'Returns the arithmetic average of numbers or ranges.', args: ['number1: First number or range.', 'number2: Additional optional numbers or ranges.'] },
  AVERAGEIF: { category: 'Statistical', syntax: 'AVERAGEIF(range, criteria, [average_range])', description: 'Returns the average of values that meet one condition.', args: ['range: Cells to test.', 'criteria: Condition to match.', 'average_range: Cells to average if different from range.'] },
  AVERAGEIFS: { category: 'Statistical', syntax: 'AVERAGEIFS(average_range, criteria_range1, criteria1, ...)', description: 'Returns the average of values that meet multiple conditions.', args: ['average_range: Cells to average.', 'criteria_range1: First range to test.', 'criteria1: First condition.'] },
  MIN: { category: 'Statistical', syntax: 'MIN(number1, [number2], ...)', description: 'Returns the smallest number from supplied values.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  MAX: { category: 'Statistical', syntax: 'MAX(number1, [number2], ...)', description: 'Returns the largest number from supplied values.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  MEDIAN: { category: 'Statistical', syntax: 'MEDIAN(number1, [number2], ...)', description: 'Returns the middle value from a set of numbers.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  MODE: { category: 'Statistical', syntax: 'MODE(number1, [number2], ...)', description: 'Returns the most frequently occurring value.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  STDEV: { category: 'Statistical', syntax: 'STDEV(number1, [number2], ...)', description: 'Estimates standard deviation based on a sample.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  STDEV_P: { category: 'Statistical', syntax: 'STDEV.P(number1, [number2], ...)', description: 'Calculates standard deviation based on an entire population.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  STDEV_S: { category: 'Statistical', syntax: 'STDEV.S(number1, [number2], ...)', description: 'Estimates standard deviation based on a sample.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },

  COUNTBLANK: { category: 'Statistical', syntax: 'COUNTBLANK(range)', description: 'Counts empty cells in a range.', args: ['range: The range in which blank cells are counted.'] },
  MAXIFS: { category: 'Statistical', syntax: 'MAXIFS(max_range, criteria_range1, criteria1, ...)', description: 'Returns the maximum value from cells that meet multiple conditions.', args: ['max_range: Values to evaluate.', 'criteria_range1: First range to test.', 'criteria1: First condition.'] },
  MINIFS: { category: 'Statistical', syntax: 'MINIFS(min_range, criteria_range1, criteria1, ...)', description: 'Returns the minimum value from cells that meet multiple conditions.', args: ['min_range: Values to evaluate.', 'criteria_range1: First range to test.', 'criteria1: First condition.'] },

  ABS: { category: 'Math and Trigonometry', syntax: 'ABS(number)', description: 'Returns the absolute value of a number.', args: ['number: The number to convert to a positive value.'] },
  INT: { category: 'Math and Trigonometry', syntax: 'INT(number)', description: 'Rounds a number down to the nearest integer.', args: ['number: The number to round down.'] },
  MOD: { category: 'Math and Trigonometry', syntax: 'MOD(number, divisor)', description: 'Returns the remainder after division.', args: ['number: The number to divide.', 'divisor: The number to divide by.'] },
  PRODUCT: { category: 'Math and Trigonometry', syntax: 'PRODUCT(number1, [number2], ...)', description: 'Multiplies numbers together.', args: ['number1: First number or range.', 'number2: Additional optional values.'] },
  SUBTOTAL: { category: 'Math and Trigonometry', syntax: 'SUBTOTAL(function_num, ref1, [ref2], ...)', description: 'Returns a subtotal using a specified calculation type, often useful with filtered lists.', args: ['function_num: Number that chooses the calculation type.', 'ref1: First range.', 'ref2: Additional optional ranges.'] },
  AGGREGATE: { category: 'Math and Trigonometry', syntax: 'AGGREGATE(function_num, options, array, [k])', description: 'Performs calculations with options to ignore hidden rows, errors, or nested subtotals.', args: ['function_num: Calculation type.', 'options: What to ignore.', 'array: Values to calculate.', 'k: Optional position for some functions.'] },
  CEILING: { category: 'Math and Trigonometry', syntax: 'CEILING(number, significance)', description: 'Rounds a number up to the nearest multiple of significance.', args: ['number: Number to round.', 'significance: Multiple to round to.'] },
  FLOOR: { category: 'Math and Trigonometry', syntax: 'FLOOR(number, significance)', description: 'Rounds a number down to the nearest multiple of significance.', args: ['number: Number to round.', 'significance: Multiple to round to.'] },
  MROUND: { category: 'Math and Trigonometry', syntax: 'MROUND(number, multiple)', description: 'Rounds a number to the nearest specified multiple.', args: ['number: Number to round.', 'multiple: Multiple to round to.'] },
  POWER: { category: 'Math and Trigonometry', syntax: 'POWER(number, power)', description: 'Raises a number to a specified power.', args: ['number: Base number.', 'power: Exponent.'] },
  SQRT: { category: 'Math and Trigonometry', syntax: 'SQRT(number)', description: 'Returns the square root of a number.', args: ['number: Number to calculate square root for.'] },

  DATEVALUE: { category: 'Date and Time', syntax: 'DATEVALUE(date_text)', description: 'Converts a date stored as text into an Excel date value.', args: ['date_text: Text representing a date.'] },
  TIME: { category: 'Date and Time', syntax: 'TIME(hour, minute, second)', description: 'Returns a time value from hour, minute, and second values.', args: ['hour: Hour value.', 'minute: Minute value.', 'second: Second value.'] },
  TODAY: { category: 'Date and Time', syntax: 'TODAY()', description: 'Returns the current date.', args: [] },
  NOW: { category: 'Date and Time', syntax: 'NOW()', description: 'Returns the current date and time.', args: [] },
  DAY: { category: 'Date and Time', syntax: 'DAY(serial_number)', description: 'Returns the day of the month from a date.', args: ['serial_number: Date value.'] },
  MONTH: { category: 'Date and Time', syntax: 'MONTH(serial_number)', description: 'Returns the month number from a date.', args: ['serial_number: Date value.'] },
  YEAR: { category: 'Date and Time', syntax: 'YEAR(serial_number)', description: 'Returns the year from a date.', args: ['serial_number: Date value.'] },
  HOUR: { category: 'Date and Time', syntax: 'HOUR(serial_number)', description: 'Returns the hour from a time value.', args: ['serial_number: Time value.'] },
  MINUTE: { category: 'Date and Time', syntax: 'MINUTE(serial_number)', description: 'Returns the minute from a time value.', args: ['serial_number: Time value.'] },
  SECOND: { category: 'Date and Time', syntax: 'SECOND(serial_number)', description: 'Returns the second from a time value.', args: ['serial_number: Time value.'] },
  EDATE: { category: 'Date and Time', syntax: 'EDATE(start_date, months)', description: 'Returns a date a specified number of months before or after a start date.', args: ['start_date: Starting date.', 'months: Number of months to move.'] },
  EOMONTH: { category: 'Date and Time', syntax: 'EOMONTH(start_date, months)', description: 'Returns the last day of the month a specified number of months from a start date.', args: ['start_date: Starting date.', 'months: Number of months to move.'] },
  NETWORKDAYS: { category: 'Date and Time', syntax: 'NETWORKDAYS(start_date, end_date, [holidays])', description: 'Returns the number of working days between two dates.', args: ['start_date: Start date.', 'end_date: End date.', 'holidays: Optional holiday dates to exclude.'] },
  WORKDAY: { category: 'Date and Time', syntax: 'WORKDAY(start_date, days, [holidays])', description: 'Returns a workday a specified number of working days before or after a date.', args: ['start_date: Starting date.', 'days: Number of working days.', 'holidays: Optional excluded dates.'] },

  LOWER: { category: 'Text', syntax: 'LOWER(text)', description: 'Converts text to lowercase.', args: ['text: Text to convert.'] },
  UPPER: { category: 'Text', syntax: 'UPPER(text)', description: 'Converts text to uppercase.', args: ['text: Text to convert.'] },
  PROPER: { category: 'Text', syntax: 'PROPER(text)', description: 'Capitalizes the first letter of each word.', args: ['text: Text to convert.'] },
  REPLACE: { category: 'Text', syntax: 'REPLACE(old_text, start_num, num_chars, new_text)', description: 'Replaces part of a text string with new text.', args: ['old_text: Original text.', 'start_num: Starting position.', 'num_chars: Number of characters to replace.', 'new_text: Replacement text.'] },
  SUBSTITUTE: { category: 'Text', syntax: 'SUBSTITUTE(text, old_text, new_text, [instance_num])', description: 'Replaces matching text with new text.', args: ['text: Original text.', 'old_text: Text to replace.', 'new_text: Replacement text.', 'instance_num: Optional occurrence number.'] },
  FIND: { category: 'Text', syntax: 'FIND(find_text, within_text, [start_num])', description: 'Finds the position of text inside another text string, case-sensitive.', args: ['find_text: Text to find.', 'within_text: Text to search within.', 'start_num: Optional starting position.'] },
  SEARCH: { category: 'Text', syntax: 'SEARCH(find_text, within_text, [start_num])', description: 'Finds the position of text inside another text string, not case-sensitive.', args: ['find_text: Text to find.', 'within_text: Text to search within.', 'start_num: Optional starting position.'] },
  VALUE: { category: 'Text', syntax: 'VALUE(text)', description: 'Converts text that looks like a number into a numeric value.', args: ['text: Text to convert.'] },
  NUMBERVALUE: { category: 'Text', syntax: 'NUMBERVALUE(text, [decimal_separator], [group_separator])', description: 'Converts text to a number using specified decimal and group separators.', args: ['text: Text to convert.', 'decimal_separator: Optional decimal separator.', 'group_separator: Optional thousands separator.'] },
  CLEAN: { category: 'Text', syntax: 'CLEAN(text)', description: 'Removes non-printable characters from text.', args: ['text: Text to clean.'] },
  CHAR: { category: 'Text', syntax: 'CHAR(number)', description: 'Returns the character specified by a code number.', args: ['number: Character code.'] },
  CODE: { category: 'Text', syntax: 'CODE(text)', description: 'Returns the numeric code for the first character in text.', args: ['text: Text to evaluate.'] },

  CHOOSE: { category: 'Lookup and Reference', syntax: 'CHOOSE(index_num, value1, [value2], ...)', description: 'Returns a value from a list based on a position number.', args: ['index_num: Position to return.', 'value1: First value.', 'value2: Additional optional values.'] },
  HLOOKUP: { category: 'Lookup and Reference', syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])', description: 'Searches the top row of a table and returns a value from a specified row.', args: ['lookup_value: Value to search for.', 'table_array: Table range.', 'row_index_num: Row number to return from.', 'range_lookup: TRUE approximate or FALSE exact match.'] },
  LOOKUP: { category: 'Lookup and Reference', syntax: 'LOOKUP(lookup_value, lookup_vector, [result_vector])', description: 'Looks up a value in one row or column and returns a corresponding value.', args: ['lookup_value: Value to search for.', 'lookup_vector: Range to search.', 'result_vector: Optional range to return from.'] },
  XMATCH: { category: 'Lookup and Reference', syntax: 'XMATCH(lookup_value, lookup_array, [match_mode], [search_mode])', description: 'Returns the relative position of a value in an array or range.', args: ['lookup_value: Value to find.', 'lookup_array: Range to search.', 'match_mode: Optional match behavior.', 'search_mode: Optional search direction.'] },
  OFFSET: { category: 'Lookup and Reference', syntax: 'OFFSET(reference, rows, cols, [height], [width])', description: 'Returns a reference offset from a starting cell or range.', args: ['reference: Starting reference.', 'rows: Rows to move.', 'cols: Columns to move.', 'height: Optional height.', 'width: Optional width.'] },
  ADDRESS: { category: 'Lookup and Reference', syntax: 'ADDRESS(row_num, column_num, [abs_num], [a1], [sheet_text])', description: 'Returns a cell address as text from row and column numbers.', args: ['row_num: Row number.', 'column_num: Column number.', 'abs_num: Optional reference type.', 'a1: Optional style.', 'sheet_text: Optional sheet name.'] },
  COLUMN: { category: 'Lookup and Reference', syntax: 'COLUMN([reference])', description: 'Returns the column number of a reference.', args: ['reference: Optional reference.'] },
  COLUMNS: { category: 'Lookup and Reference', syntax: 'COLUMNS(array)', description: 'Returns the number of columns in a range or array.', args: ['array: Range or array.'] },
  ROWS: { category: 'Lookup and Reference', syntax: 'ROWS(array)', description: 'Returns the number of rows in a range or array.', args: ['array: Range or array.'] },
  TRANSPOSE: { category: 'Lookup and Reference', syntax: 'TRANSPOSE(array)', description: 'Rotates rows to columns or columns to rows.', args: ['array: Range or array to transpose.'] },

  ISBLANK: { category: 'Information', syntax: 'ISBLANK(value)', description: 'Checks whether a value is blank.', args: ['value: Cell or value to test.'] },
  ISERROR: { category: 'Information', syntax: 'ISERROR(value)', description: 'Checks whether a value is any Excel error.', args: ['value: Value to test.'] },
  ISNA: { category: 'Information', syntax: 'ISNA(value)', description: 'Checks whether a value is the #N/A error.', args: ['value: Value to test.'] },
  ISNUMBER: { category: 'Information', syntax: 'ISNUMBER(value)', description: 'Checks whether a value is a number.', args: ['value: Value to test.'] },
  ISTEXT: { category: 'Information', syntax: 'ISTEXT(value)', description: 'Checks whether a value is text.', args: ['value: Value to test.'] },
  ISFORMULA: { category: 'Information', syntax: 'ISFORMULA(reference)', description: 'Checks whether a cell contains a formula.', args: ['reference: Cell to check.'] },
  ISODD: { category: 'Information', syntax: 'ISODD(number)', description: 'Checks whether a number is odd.', args: ['number: Number to test.'] },
  ISEVEN: { category: 'Information', syntax: 'ISEVEN(number)', description: 'Checks whether a number is even.', args: ['number: Number to test.'] },

  PMT: { category: 'Financial', syntax: 'PMT(rate, nper, pv, [fv], [type])', description: 'Calculates the payment for a loan based on constant payments and interest rate.', args: ['rate: Interest rate per period.', 'nper: Number of periods.', 'pv: Present value or loan amount.', 'fv: Optional future value.', 'type: Optional payment timing.'] },
  PV: { category: 'Financial', syntax: 'PV(rate, nper, pmt, [fv], [type])', description: 'Calculates the present value of an investment or loan.', args: ['rate: Interest rate per period.', 'nper: Number of periods.', 'pmt: Payment per period.', 'fv: Optional future value.', 'type: Optional payment timing.'] },
  FV: { category: 'Financial', syntax: 'FV(rate, nper, pmt, [pv], [type])', description: 'Calculates the future value of an investment.', args: ['rate: Interest rate per period.', 'nper: Number of periods.', 'pmt: Payment per period.', 'pv: Optional present value.', 'type: Optional payment timing.'] },
  NPV: { category: 'Financial', syntax: 'NPV(rate, value1, [value2], ...)', description: 'Calculates net present value using a discount rate and cash flows.', args: ['rate: Discount rate.', 'value1: First cash flow.', 'value2: Additional optional cash flows.'] },
  IRR: { category: 'Financial', syntax: 'IRR(values, [guess])', description: 'Returns the internal rate of return for cash flows.', args: ['values: Cash flow values.', 'guess: Optional estimated result.'] }
};

Object.assign(EXCEL_FUNCTIONS, COMMON_EXCEL_FUNCTIONS_BATCH_1);

export function getExcelFunctionInfo(name) {
  return EXCEL_FUNCTIONS[String(name || '').toUpperCase()] || null;
}
