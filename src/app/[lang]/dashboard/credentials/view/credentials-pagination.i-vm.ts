export default interface CredentialsPaginationIVM {
  page: number;
  totalPages: number;
  isDisabled: boolean;
  onPageChange: (page: number) => void;
}
