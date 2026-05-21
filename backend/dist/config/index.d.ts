export declare const config: {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: number;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    FRONTEND_URL: string;
    REDIS_PASSWORD?: string | undefined;
    UPSTASH_REDIS_REST_URL?: string | undefined;
    UPSTASH_REDIS_REST_TOKEN?: string | undefined;
    AWS_ACCESS_KEY_ID?: string | undefined;
    AWS_SECRET_ACCESS_KEY?: string | undefined;
    AWS_SESSION_TOKEN?: string | undefined;
    AWS_REGION?: string | undefined;
    AWS_BUCKET_NAME?: string | undefined;
};
