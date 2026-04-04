export default interface EditorHeaderIVM {
  workflowName: string;
  isEditingName: boolean;
  editedName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onNameChange: (name: string) => void;
  onStartEditing: () => void;
  onSaveName: () => Promise<void>;
  onCancelEditing: () => void;
  onSaveWorkflow: () => void;
  isSavingName: boolean;
  isSavingWorkflow: boolean;
}
