import './syntax/character-classes';
import './syntax/boundaries';
import './syntax/groups';
import './syntax/quantifiers';
import './syntax/alternation';
import './syntax/lookarounds';
import './syntax/flags';

export * from './core/builder';
export { entityKind } from './core/types';
export type { 
  ASTNode, 
  DefaultCaptures, 
  DefaultFlags, 
  CompiledRegex, 
  MatchResult, 
  SingleMatch 
} from './core/types';
