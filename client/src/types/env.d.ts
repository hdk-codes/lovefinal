declare namespace NodeJS {
  interface ProcessEnv {
    SANITY_PROJECT_ID: string;
    SANITY_DATASET: string;
    SANITY_TOKEN: string;
    SESSION_SECRET?: string;
    NODE_ENV?: 'development' | 'production';
  }
}
