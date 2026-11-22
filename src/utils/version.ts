export const APP_VERSION = "1.0.0";
export const REPO_URL = "https://github.com/samithseu/websheet";
export const COMMIT_HASH: string = import.meta.env.VITE_COMMIT_HASH || "dev";
export const isDevCommit: boolean = COMMIT_HASH === "dev";
export const COMMIT_URL: string = isDevCommit ? REPO_URL : `${REPO_URL}/commit/${COMMIT_HASH}`;
