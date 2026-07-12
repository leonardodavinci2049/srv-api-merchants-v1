export interface ApiInfoDto {
  name: string;
  status: string;
  version: string;
  documentation: string;
  timestamp: string;
  endpoints: {
    base: string;
    auth?: string;
    users?: string;
    [key: string]: string | undefined;
  };
}
