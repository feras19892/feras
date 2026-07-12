import { tokenize, type Token } from './tokenizer.js';

export interface Polynomial {
  coefficients: Map<number, number>;
  variable: string;
}

export function parsePolynomial(input: string, variable: string): Polynomial {
  const tokens = tokenize(input);
  const coefficients = new Map<number, number>();
  let sign = 1;
  let i = 0;

  function peek(): Token | undefined {
    return tokens[i];
  }

  function consume(): Token {
    return tokens[i++];
  }

  function addTerm(coef: number, power: number) {
    coefficients.set(power, (coefficients.get(power) ?? 0) + sign * coef);
  }

  while (i < tokens.length) {
    const tok = peek()!;
    if (tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
      sign = tok.value === '+' ? 1 : -1;
      consume();
      continue;
    }

    let coef = 1;
    let power = 0;

    if (tok.type === 'number') {
      coef = Number(tok.value);
      consume();
      const next = peek();
      if (next?.type === 'ident' && next.value === variable) {
        consume();
        power = 1;
        const after = peek();
        if (after?.type === 'op' && after.value === '^') {
          consume();
          const exp = consume();
          if (exp.type !== 'number') throw new Error(`Expected exponent after ${variable}^`);
          power = Number(exp.value);
        }
      }
    } else if (tok.type === 'ident' && tok.value === variable) {
      consume();
      power = 1;
      const after = peek();
      if (after?.type === 'op' && after.value === '^') {
        consume();
        const exp = consume();
        if (exp.type !== 'number') throw new Error(`Expected exponent after ${variable}^`);
        power = Number(exp.value);
      }
    } else if (tok.type === 'ident') {
      throw new Error(`Unexpected variable: ${tok.value}`);
    } else {
      throw new Error(`Unexpected token: ${tok.value}`);
    }

    addTerm(coef, power);
    sign = 1;
  }

  return { coefficients, variable };
}

export interface StandardForm {
  a: number;
  b: number;
  c: number;
  variable: string;
}

export function parseEquation(input: string, variable: string): StandardForm {
  const sides = input.split('=');
  if (sides.length !== 2) throw new Error('Equation must contain exactly one equals sign');

  const left = parsePolynomial(sides[0] || '0', variable);
  const right = parsePolynomial(sides[1] || '0', variable);

  const get = (p: Polynomial, power: number) => p.coefficients.get(power) ?? 0;
  const a = get(left, 2) - get(right, 2);
  const b = get(left, 1) - get(right, 1);
  const c = get(left, 0) - get(right, 0);

  return { a, b, c, variable };
}

export interface Assignment {
  name: string;
  value: number | null;
}

export function parseAssignments(input: string): Assignment[] {
  const tokens = tokenize(input);
  const assignments: Assignment[] = [];
  let i = 0;

  while (i < tokens.length) {
    const name = tokens[i];
    if (name?.type !== 'ident') throw new Error('Assignment must start with a variable name');
    if (tokens[i + 1]?.type !== 'eq') throw new Error(`Expected = after ${name.value}`);
    const value = tokens[i + 2];
    if (!value) throw new Error(`Expected value after ${name.value}=`);
    let numeric: number | null = null;
    if (value.type === 'number') numeric = Number(value.value);
    else if (value.type !== 'op' || value.value !== '?') {
      throw new Error(`Expected number or ? after ${name.value}=`);
    }
    assignments.push({ name: name.value, value: numeric });
    i += 3;
    if (tokens[i]?.type === 'semi' || tokens[i]?.type === 'comma') i++;
  }

  return assignments;
}

export type AstNode =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'constant'; name: string }
  | { type: 'call'; name: string; args: AstNode[] }
  | { type: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: AstNode; right: AstNode };

export function parseExpression(input: string): AstNode {
  const tokens = tokenize(input);
  let i = 0;

  function peek(): Token | undefined {
    return tokens[i];
  }

  function consume(): Token {
    return tokens[i++];
  }

  function parseExpr(): AstNode {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek()!.value === '+' || peek()!.value === '-')) {
      const op = consume().value as '+' | '-';
      const right = parseTerm();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  function parseTerm(): AstNode {
    let left = parsePower();
    while (peek()?.type === 'op' && (peek()!.value === '*' || peek()!.value === '/')) {
      const op = consume().value as '*' | '/';
      const right = parsePower();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  function parsePower(): AstNode {
    let left = parseUnary();
    if (peek()?.type === 'op' && peek()!.value === '^') {
      consume();
      const right = parseUnary();
      left = { type: 'binary', op: '^', left, right };
    }
    return left;
  }

  function parseUnary(): AstNode {
    if (peek()?.type === 'op' && (peek()!.value === '+' || peek()!.value === '-')) {
      const op = consume().value;
      const node = parseUnary();
      return op === '-' ? { type: 'binary', op: '-', left: { type: 'number', value: 0 }, right: node } : node;
    }
    return parsePrimary();
  }

  function parsePrimary(): AstNode {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of expression');

    if (tok.type === 'number') {
      consume();
      return { type: 'number', value: Number(tok.value) };
    }

    if (tok.type === 'ident') {
      consume();
      if (tok.value === 'pi') return { type: 'constant', name: 'pi' };
      if (tok.value === 'e') return { type: 'constant', name: 'e' };
      if (peek()?.type === 'paren' && peek()!.value === '(') {
        consume();
        const args: AstNode[] = [];
        if (peek()?.value !== ')') args.push(parseExpr());
        while (peek()?.type === 'comma') {
          consume();
          args.push(parseExpr());
        }
        if (peek()?.value !== ')') throw new Error(`Expected ) after ${tok.value}(`);
        consume();
        return { type: 'call', name: tok.value, args };
      }
      return { type: 'variable', name: tok.value };
    }

    if (tok.type === 'paren' && tok.value === '(') {
      consume();
      const node = parseExpr();
      if (peek()?.value !== ')') throw new Error('Expected )');
      consume();
      return node;
    }

    throw new Error(`Unexpected token: ${tok.value}`);
  }

  const result = parseExpr();
  if (i < tokens.length) throw new Error(`Unexpected token: ${tokens[i].value}`);
  return result;
}
