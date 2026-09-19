import * as AWS from "aws-sdk";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root and current directory
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/server/.env") });
dotenv.config({ path: path.resolve(import.meta.dir, "../.env") });
dotenv.config();

type SecretValues = Record<string, string>;

let secrets: SecretValues | null = null;
let useSecretsManager = false;

const getBootstrapEnv = (key: string) => process.env[key]?.trim();

const getSecretId = () =>
  getBootstrapEnv("AWS_SECRETS_MANAGER_SECRET_ID") ??
  getBootstrapEnv("SECRETS_MANAGER_SECRET_ID");

const getSecretRegion = () =>
  getBootstrapEnv("AWS_SECRETS_MANAGER_REGION") ??
  getBootstrapEnv("SECRETS_MANAGER_REGION") ??
  "us-east-1";

const createSecretsManagerClient = () => {
  const accessKeyId = getBootstrapEnv("AWS_SECRETS_MANAGER_ACCESS_KEY_ID");
  const secretAccessKey = getBootstrapEnv(
    "AWS_SECRETS_MANAGER_SECRET_ACCESS_KEY",
  );
  const sessionToken = getBootstrapEnv("AWS_SECRETS_MANAGER_SESSION_TOKEN");

  return new AWS.SecretsManager({
    region: getSecretRegion(),
    ...(accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        }
      : {}),
  });
};

const decodeSecretString = (secretString?: string, secretBinary?: any) => {
  if (secretString) {
    return secretString;
  }

  if (secretBinary) {
    return Buffer.from(secretBinary as Uint8Array).toString("utf8");
  }

  throw new Error("Secrets Manager returned an empty secret");
};

const parseSecretValues = (rawSecret: string): SecretValues => {
  const parsed = JSON.parse(rawSecret) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(parsed)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]),
  );
};

export const loadConfig = async () => {
  if (secrets) {
    return secrets;
  }

  const secretId = getSecretId();
  const isDevelopment = getBootstrapEnv("NODE_ENV") !== "production";

  // For development, allow falling back to local .env
  if (!secretId && isDevelopment) {
    console.log("⚠️  AWS Secrets Manager not configured. Using local .env for development.");
    secrets = process.env as SecretValues;
    useSecretsManager = false;
    return secrets;
  }

  if (!secretId) {
    throw new Error(
      "AWS_SECRETS_MANAGER_SECRET_ID is required in production. For development, set NODE_ENV=development to use local .env",
    );
  }

  try {
    const response = await createSecretsManagerClient()
      .getSecretValue({
        SecretId: secretId,
      })
      .promise();

    secrets = parseSecretValues(
      decodeSecretString(response.SecretString, response.SecretBinary),
    );
    useSecretsManager = true;
    console.log("✓ Configuration loaded from AWS Secrets Manager");
  } catch (error) {
    console.error("Failed to load from Secrets Manager:", error);

    if (isDevelopment) {
      console.log("⚠️  Falling back to local .env for development");
      secrets = process.env as SecretValues;
      useSecretsManager = false;
    } else {
      throw error;
    }
  }

  return secrets;
};

const getSecrets = () => {
  if (!secrets) {
    throw new Error("Application config has not been loaded. Call loadConfig() first.");
  }
  return secrets;
};

export function getConfigValue(key: string): string | undefined;
export function getConfigValue(key: string, fallback: string): string;
export function getConfigValue(key: string, fallback?: string) {
  // Try to get from loaded secrets first
  const value = getSecrets()[key];
  if (value !== undefined) return value;

  // If not using Secrets Manager, try process.env directly
  if (!useSecretsManager) {
    return process.env[key] ?? fallback;
  }

  return fallback;
}

export const requireConfigValue = (key: string) => {
  const value = getConfigValue(key);

  if (!value) {
    throw new Error(`${key} is required in configuration`);
  }

  return value;
};

export const isProduction = () => getConfigValue("NODE_ENV") === "production";
