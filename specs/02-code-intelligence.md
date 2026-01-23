# Feature Spec: Code Intelligence Layer

**Feature ID:** VF-002
**Version:** 1.0
**Status:** Proposed
**Priority:** HIGH
**Target Release:** v1.1.0
**Estimated Effort:** 4 weeks
**Owner:** TBD

---

## Executive Summary

Add real-time code analysis and intelligence using tree-sitter parsers and static analysis. Provides developers with:
- Live dependency graphs
- Code complexity heatmaps
- Refactoring suggestions
- Impact analysis for changes

**Key Differentiator:** First AI coding tool with integrated static analysis visualization in 3D space.

---

## Problem Statement

### Current State
- No visibility into code structure
- Can't see dependencies between files
- No complexity metrics
- Refactoring suggestions are manual

### User Pain Points
```
AS A developer
I WANT TO see code dependencies visually
SO THAT I understand the impact of my changes

AS A tech lead
I WANT TO identify complex code
SO THAT I can prioritize refactoring efforts

AS A new team member
I WANT TO understand codebase structure
SO THAT I can navigate effectively
```

---

## Technical Design

### Architecture

```
┌──────────────────────────────────────────────────┐
│           File Watcher (chokidar)                │
│   Detects file changes in workspace             │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│        Tree-sitter Parser Pool                   │
│   • TypeScript    • Python                       │
│   • JavaScript    • Go                           │
│   • Java          • Rust                         │
│   • (extensible)                                 │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│          Analysis Engine                         │
│   • Dependency extraction                        │
│   • Complexity calculation                       │
│   • Symbol indexing                              │
│   • Type inference                               │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│        Intelligence Database                     │
│   Supabase tables:                               │
│   • code_files                                   │
│   • dependencies                                 │
│   • symbols                                      │
│   • metrics                                      │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│         Visualization Layer                      │
│   • 3D dependency graph                          │
│   • Heatmap overlay                              │
│   • Suggestion cards                             │
│   • Impact preview                               │
└──────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Code files with metadata
CREATE TABLE code_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  workspace_id uuid REFERENCES workspaces(id),
  path text NOT NULL,
  language text NOT NULL,
  size_bytes integer NOT NULL,
  line_count integer NOT NULL,
  complexity_score integer,  -- Cyclomatic complexity
  last_modified timestamptz,
  content_hash text,  -- For change detection
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, path)
);

-- Inter-file dependencies
CREATE TABLE dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_file_id uuid REFERENCES code_files(id) ON DELETE CASCADE,
  to_file_id uuid REFERENCES code_files(id) ON DELETE CASCADE,
  import_type text,  -- 'import', 'require', 'include'
  line_number integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_file_id, to_file_id, line_number)
);

-- Symbols (functions, classes, variables)
CREATE TABLE symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES code_files(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,  -- 'function', 'class', 'variable', 'interface'
  start_line integer NOT NULL,
  end_line integer NOT NULL,
  complexity integer,
  is_exported boolean DEFAULT false,
  metadata jsonb,  -- Parameters, return type, etc.
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_symbols_file_id ON symbols(file_id);
CREATE INDEX idx_symbols_name ON symbols(name);

-- Code metrics over time
CREATE TABLE code_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id),
  total_files integer,
  total_lines integer,
  avg_complexity numeric,
  dependency_count integer,
  hotspots jsonb,  -- Files changed frequently
  measured_at timestamptz DEFAULT now()
);

-- Refactoring suggestions
CREATE TABLE refactoring_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES code_files(id) ON DELETE CASCADE,
  type text NOT NULL,  -- 'extract_function', 'reduce_complexity', 'remove_dead_code'
  severity text NOT NULL,  -- 'info', 'warning', 'error'
  line_start integer NOT NULL,
  line_end integer NOT NULL,
  message text NOT NULL,
  auto_fix_available boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### Analysis Pipeline

```typescript
// Parser Manager
class ParserManager {
  private parsers: Map<string, Parser>

  async parseFile(path: string, content: string): Promise<Tree> {
    const language = detectLanguage(path)
    const parser = this.getParser(language)
    return parser.parse(content)
  }

  private getParser(language: string): Parser {
    if (!this.parsers.has(language)) {
      this.parsers.set(language, this.createParser(language))
    }
    return this.parsers.get(language)!
  }
}

// Dependency Analyzer
class DependencyAnalyzer {
  async extractDependencies(tree: Tree, filePath: string): Promise<Dependency[]> {
    const query = this.getQueryForLanguage(tree.language)
    const captures = query.captures(tree.rootNode)

    return captures
      .filter(c => c.name === 'import')
      .map(c => this.resolveImport(c.node, filePath))
  }

  private resolveImport(node: SyntaxNode, basePath: string): Dependency {
    const importPath = node.text.match(/['"](.+)['"]/)?.[1]
    return {
      from: basePath,
      to: this.resolvePath(importPath, basePath),
      line: node.startPosition.row
    }
  }
}

// Complexity Calculator
class ComplexityAnalyzer {
  calculateCyclomaticComplexity(tree: Tree): number {
    let complexity = 1 // Base complexity

    const query = tree.language.query(`
      (if_statement) @branch
      (while_statement) @branch
      (for_statement) @branch
      (case_clause) @branch
      (catch_clause) @branch
      (conditional_expression) @branch
      (logical_expression operator: ["&&", "||"]) @branch
    `)

    complexity += query.captures(tree.rootNode).length
    return complexity
  }

  identifyHotspots(files: CodeFile[]): CodeFile[] {
    return files
      .filter(f => f.complexity_score > 15) // McCabe threshold
      .sort((a, b) => b.complexity_score - a.complexity_score)
  }
}
```

### API Endpoints

```typescript
// Trigger analysis
POST /api/intelligence/analyze
Body: { workspace_id: string, paths?: string[] }
Response: { job_id: string, status: 'queued' }

// Get analysis results
GET /api/intelligence/workspaces/:workspace_id/analysis
Response: {
  files: CodeFile[]
  dependencies: Dependency[]
  metrics: CodeMetrics
  suggestions: RefactoringSuggestion[]
}

// Get dependency graph
GET /api/intelligence/workspaces/:workspace_id/dependencies
Query: { depth?: number, from_file?: string }
Response: { nodes: FileNode[], edges: DependencyEdge[] }

// Get file complexity
GET /api/intelligence/files/:file_id/complexity
Response: {
  cyclomatic: number
  cognitive: number
  functions: FunctionComplexity[]
}

// Get refactoring suggestions
GET /api/intelligence/workspaces/:workspace_id/suggestions
Query: { severity?: string, dismissed?: boolean }
Response: { suggestions: RefactoringSuggestion[] }

// Dismiss suggestion
POST /api/intelligence/suggestions/:suggestion_id/dismiss
Response: { ok: boolean }
```

---

## User Interface

### Dependency Graph View

```
Toggle view: 🗺️ Dependency Graph

┌─────────────────────────────────────────────────────┐
│                                                      │
│     auth.ts ──────┬────────> api.ts                 │
│         │         │              │                   │
│         │         └──────> db.ts│                   │
│         │                   │    │                   │
│         ▼                   ▼    ▼                   │
│    types.ts           models.ts  utils.ts           │
│         │                   │                        │
│         └───────────────────┘                        │
│                                                      │
│  Legend:  ● Low complexity  ● Medium  ● High        │
│                                                      │
│  [Filter by type] [Show circular] [Export PNG]      │
└─────────────────────────────────────────────────────┘
```

### Complexity Heatmap Overlay

```
Toggle: 🔥 Show Complexity

Workshop zones with color overlay:
- Green: Low complexity (<5)
- Yellow: Medium (5-10)
- Orange: High (10-15)
- Red: Critical (>15)

Hover file station shows:
┌────────────────────────┐
│ src/auth.ts            │
│ Complexity: 18 (High)  │
│                        │
│ Suggestions:           │
│ • Extract auth logic   │
│ • Reduce nesting       │
│ • Split into 3 files   │
│                        │
│ [View Details]         │
└────────────────────────┘
```

### Refactoring Panel

```
┌─────────────────────────────────────────────────────┐
│  Code Intelligence                       [Settings]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ⚠️  3 high-priority suggestions                    │
│  ℹ️  12 informational suggestions                   │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  ⚠️  High Complexity in auth.ts:validateUser       │
│      Line 45-89 (45 lines, complexity: 18)         │
│                                                      │
│      Suggestion: Extract validation logic           │
│      Impact: Improves maintainability by 40%        │
│                                                      │
│      [View Code] [Apply Fix] [Dismiss]              │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  ⚠️  Circular Dependency Detected                   │
│      auth.ts ↔ db.ts ↔ models.ts                   │
│                                                      │
│      Suggestion: Introduce dependency injection     │
│                                                      │
│      [View Graph] [Learn More] [Dismiss]            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Parser Integration (Week 1)
**Tasks:**
- [ ] Set up tree-sitter parsers (TS, JS, Python)
- [ ] Create ParserManager class
- [ ] Build file watcher integration
- [ ] Implement basic AST traversal
- [ ] Store parsed results in database

**Deliverables:**
- Files parsed on save
- AST stored in database
- Basic symbol extraction

### Phase 2: Dependency Analysis (Week 2)
**Tasks:**
- [ ] Build DependencyAnalyzer
- [ ] Implement import resolution
- [ ] Detect circular dependencies
- [ ] Create dependency graph data structure
- [ ] Add dependencies table

**Deliverables:**
- Dependency graph generation
- Circular dependency detection
- API endpoints for graph data

### Phase 3: Complexity & Metrics (Week 3)
**Tasks:**
- [ ] Implement complexity calculators
- [ ] Build metrics collection pipeline
- [ ] Create heatmap visualization
- [ ] Add trend tracking over time
- [ ] Generate refactoring suggestions

**Deliverables:**
- Complexity scores per file/function
- Heatmap overlay in 3D scene
- Suggestion engine

### Phase 4: UI & Refinement (Week 4)
**Tasks:**
- [ ] Build dependency graph viewer
- [ ] Create refactoring panel
- [ ] Add complexity tooltips
- [ ] Implement auto-fix suggestions
- [ ] Polish and optimize

**Deliverables:**
- Complete UI
- Auto-fix for simple cases
- Documentation

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Parse accuracy | >95% | Manual review |
| Analysis speed | <5s for 1000 files | Performance tests |
| Suggestion relevance | >70% not dismissed | User feedback |
| Adoption | >60% enable feature | Analytics |

---

## Dependencies

### External Libraries
- **tree-sitter** - AST parsing
- **tree-sitter-typescript** - TypeScript grammar
- **tree-sitter-javascript** - JavaScript grammar
- **tree-sitter-python** - Python grammar
- **d3-force** - Graph layout (optional)

### Breaking Changes
None - purely additive

---

## Open Questions

1. **Language support priority?** Start with TS/JS/Python?
   - **Proposal:** Phase 1 = TS/JS, Phase 2 = Python/Go

2. **Real-time vs batch?** Parse on save or continuous?
   - **Proposal:** Debounced (2s after last edit)

3. **Storage limits?** How much AST data to store?
   - **Proposal:** Keep last 30 days, 100MB limit per workspace

---

## Future Enhancements

### v1.2
- **AI-powered refactoring** - GPT-4 suggests better patterns
- **Cross-language analysis** - Polyglot projects
- **Performance profiling** - Hot path identification

### v2.0
- **Architecture validation** - Enforce patterns
- **Automated refactoring** - One-click fixes
- **Technical debt score** - Quantified code health

---

## References

- [tree-sitter](https://tree-sitter.github.io/tree-sitter/)
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [Feature Roadmap](../docs/FEATURE_ROADMAP.md)
