export default interface WorkflowsPaginationIVM {
  page: number;
  totalPages: number;
  isDisabled: boolean;
  onPageChange: (page: number) => void;
}
