/**
 * Shared types for workflows feature.
 * These types represent the UI layer's view of workflow data.
 */

export type Workflow = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkflowsData = {
  items: Workflow[];
  page: number;
  totalPages: number;
};

