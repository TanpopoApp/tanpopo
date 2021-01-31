import { RuleItem } from 'async-validator';

export interface Rule extends RuleItem {
  trigger: string | Array<string>;
}

export interface Rules {
  [key: string]: Array<Rule>;
}
