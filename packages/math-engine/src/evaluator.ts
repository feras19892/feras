import { parseExpression, type AstNode } from './parser.js';

function evaluateNode(node: AstNode, vars: Record<string, number>): number {
  switch (node.type) {
    case 'number':
      return node.value;
    case 'variable':
      if (!(node.name in vars)) throw new Error(`Unknown variable: ${node.name}`);
      return vars[node.name];
    case 'constant':
      if (node.name === 'pi') return Math.PI;
      if (node.name === 'e') return Math.E;
      throw new Error(`Unknown constant: ${node.name}`);
    case 'call': {
      if (node.name === 'sqrt') {
        if (node.args.length !== 1) throw new Error('sqrt expects one argument');
        return Math.sqrt(evaluateNode(node.args[0], vars));
      }
      throw new Error(`Unknown function: ${node.name}`);
    }
    case 'binary': {
      const left = evaluateNode(node.left, vars);
      const right = evaluateNode(node.right, vars);
      switch (node.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) throw new Error('Division by zero');
          return left / right;
        case '^':
          return Math.pow(left, right);
      }
    }
  }
}

export function evaluateExpression(input: string, vars: Record<string, number> = {}): number {
  const node = parseExpression(input);
  return evaluateNode(node, vars);
}
