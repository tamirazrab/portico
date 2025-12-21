export default interface ExecutionsPaginationIVM {
  page: number;
  totalPages: number;
  isDisabled: boolean;
  onPageChange: (page: number) => void;
}

