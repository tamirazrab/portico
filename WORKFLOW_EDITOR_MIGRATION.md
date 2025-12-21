# Workflow Editor Migration Guide

## Overview

The Workflow Editor is the most complex component in the migration. It uses React Flow (@xyflow/react) for visual workflow editing and requires several supporting components.

## Dependencies Installed ✅

- `@xyflow/react@12.10.0` - React Flow library
- `jotai@2.16.0` - State management for editor instance

## Components to Migrate

### 1. React Flow Base Components (from NodeBase/src/components/react-flow/)

**Location:** `src/components/react-flow/`

- ✅ `node-status-indicator.tsx` - Node status visualization
- ✅ `base-node.tsx` - Base node component with status indicators
- ✅ `placeholder-node.tsx` - Placeholder node for adding new nodes

### 2. Workflow Node Components (from NodeBase/src/components/)

**Location:** `src/components/`

- ✅ `workflow-node.tsx` - Wrapper component with toolbar
- ✅ `initial-node.tsx` - Initial node component
- ✅ `node-selector.tsx` - Node type selector sheet

### 3. Editor Store

**Location:** `src/app/[lang]/dashboard/workflows/[workflowId]/store/`

- ✅ `atoms.ts` - Jotai atom for React Flow instance

### 4. Editor Components

**Location:** `src/app/[lang]/dashboard/workflows/[workflowId]/components/`

- ✅ `add-node-button.tsx` - Button to add new nodes
- ✅ `execute-workflow-button.tsx` - Button to execute workflow
- ✅ `editor-header.tsx` - Editor header with breadcrumbs and save button

### 5. Editor ViewModels and Views

**Location:** `src/app/[lang]/dashboard/workflows/[workflowId]/`

- ✅ `vm/editor.vm.ts` - Editor ViewModel managing nodes, edges, and React Flow state
- ✅ `view/editor.view.tsx` - Editor view component with React Flow
- ✅ `vm/editor-header.vm.ts` - Header ViewModel
- ✅ `view/editor-header.view.tsx` - Header view

### 6. Node Components Config

**Location:** `src/config/`

- ✅ `node-components.ts` - Mapping of NodeType to React Flow node components

### 7. Node Components

**Location:** `src/components/nodes/` or `src/feature/core/workflow/components/nodes/`

These need to be migrated from NodeBase:
- Trigger nodes: ManualTrigger, GoogleFormTrigger, StripeTrigger, CronTrigger
- Execution nodes: HttpRequest, Gemini, OpenAI, Anthropic, Discord, Slack

**Note:** The executor components already exist in `src/feature/core/execution/domain/executor/components/` but they may need React Flow node wrappers.

### 8. Editor Page

**Location:** `src/app/[lang]/dashboard/workflows/[workflowId]/page.tsx`

- Server component with auth check and suspense/error boundaries

## Migration Steps

1. Copy React Flow base components
2. Copy workflow node components
3. Create editor store with jotai
4. Create node components config
5. Create editor ViewModels and Views
6. Create editor header components
7. Create add node and execute workflow buttons
8. Create the editor page
9. Migrate/create node components (triggers and executions)

## Key Considerations

- React Flow requires `@xyflow/react/dist/style.css` to be imported
- Editor uses jotai for React Flow instance state management
- Node components must follow React Flow's NodeProps interface
- Connections between nodes are managed by React Flow
- Workflow save functionality updates nodes and edges via tRPC
- Node dialogs/settings are already implemented in executor components

## Status

**Dependencies:** ✅ Installed
**Base Components:** ⏳ Pending
**Editor Components:** ⏳ Pending
**Node Components:** ⏳ Pending
**Editor Page:** ⏳ Pending

