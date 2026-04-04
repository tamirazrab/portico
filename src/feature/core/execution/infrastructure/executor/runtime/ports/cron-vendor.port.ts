export type CronEntry = {
  id: string;
  name: string;
};

export interface CronVendorPort {
  list(token: string): Promise<CronEntry[]>;
  create(params: {
    token: string;
    timezone: string;
    name: string;
    expression: string;
    url: string;
  }): Promise<void>;
  update(params: {
    token: string;
    id: string;
    expression: string;
    timezone?: string;
  }): Promise<void>;
  remove(params: { token: string; id: string }): Promise<void>;
}
