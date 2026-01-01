# Phase 8: Testing & Documentation

## Context
- Final phase for quality assurance
- Dependencies: Phase 1-7

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~30+ tests |

## Requirements
- Comprehensive unit tests
- Integration tests with mocked API
- Documentation

## Implementation Steps

### 1. Unit Tests - Discord Module
Directory: `tests/discord/`
- [ ] `snowflake.test.ts`
  - Parse from string
  - ToDate conversion
  - FromDate creation
  - Comparison operators
  - Max/min values

- [ ] `data/*.test.ts`
  - Parse each model from JSON fixtures
  - Computed properties
  - Edge cases (null fields, missing optional)

### 2. Unit Tests - Markdown Module
Directory: `tests/markdown/`
- [ ] `markdown-parser.test.ts`
  - Each formatting type
  - Nested formatting
  - Escaped characters
  - Mentions all kinds
  - Emoji standard and custom
  - Timestamps valid and invalid
  - Code blocks
  - Links
  - Edge cases

### 3. Unit Tests - Exporting Module
Directory: `tests/exporting/`
- [ ] `partition-limit.test.ts`
  - File size parsing
  - Message count parsing
  - isReached logic

- [ ] `message-filter.test.ts`
  - Each filter type
  - Boolean combinations
  - Edge cases

- [ ] `filter-grammar.test.ts`
  - Parse expressions
  - Quoted strings
  - Negation
  - Parentheses

### 4. Snapshot Tests - Format Writers
Directory: `tests/exporting/writers/`
- [ ] `json-writer.test.ts` - JSON output snapshots
- [ ] `csv-writer.test.ts` - CSV output snapshots
- [ ] `plain-text-writer.test.ts` - Text output snapshots
- [ ] `html-writer.test.ts` - HTML output snapshots

### 5. Integration Tests
Directory: `tests/integration/`
- [ ] Mock Discord API responses
- [ ] Full export flow
- [ ] Rate limiting behavior
- [ ] Error scenarios

### 6. API Fixtures
Directory: `tests/fixtures/`
- [ ] Sample API responses
- [ ] Sample messages (all types)
- [ ] Sample channels (all kinds)
- [ ] Sample embeds

### 7. Documentation
- [ ] `README.md` - Installation, usage
- [ ] TypeDoc configuration
- [ ] API documentation
- [ ] Examples directory
  - Basic export
  - With filtering
  - With partitioning
  - Programmatic usage

### 8. CI/CD Setup
- [ ] GitHub Actions workflow
- [ ] Test on multiple Node versions
- [ ] Type checking
- [ ] Lint checking
- [ ] npm publish workflow

## Todo List
- [ ] Write Snowflake unit tests
- [ ] Write data model tests
- [ ] Write markdown parser tests
- [ ] Write filter tests
- [ ] Write format writer snapshot tests
- [ ] Write integration tests
- [ ] Create test fixtures
- [ ] Write README
- [ ] Setup TypeDoc
- [ ] Create examples
- [ ] Setup GitHub Actions

## Success Criteria
- [ ] >80% code coverage
- [ ] All tests pass
- [ ] Documentation complete
- [ ] CI pipeline green

## Risk Assessment
- Low risk, straightforward testing
- May find bugs requiring fixes in previous phases
