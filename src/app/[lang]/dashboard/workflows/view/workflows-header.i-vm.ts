export default interface WorkflowsHeaderIVM {
  title: string;
  description: string;
  createButtonLabel: string;
  isCreating: boolean;
  onCreate: () => void;
  disabled: boolean;
}

