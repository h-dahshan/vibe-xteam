import { describe, it, expect, beforeEach, afterEach } from "vitest";
import storageConfig from "./storage.config";

describe("StorageConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load local storage configuration", () => {
    process.env.MAX_FILE_SIZE = "5242880"; // 5MB
    process.env.ALLOWED_FILE_TYPES = "jpg,png,gif";
    process.env.LOCAL_STORAGE_PATH = "./uploads";

    const config = storageConfig();

    expect(config).toEqual({
      maxFileSize: 5242880,
      allowedFileTypes: ["jpg", "png", "gif"],
      localStoragePath: "./uploads",
      s3Region: undefined,
      s3Bucket: undefined,
      s3Endpoint: undefined,
      s3AccessKey: undefined,
      s3AccessKeySecret: undefined,
    });
  });

  it("should load S3 storage configuration", () => {
    process.env.MAX_FILE_SIZE = "20971520"; // 20MB
    process.env.ALLOWED_FILE_TYPES = "jpg, png, pdf, doc, docx";
    process.env.SUPABASE_S3_REGION = "us-east-1";
    process.env.SUPABASE_S3_BUCKET = "my-bucket";
    process.env.SUPABASE_S3_ENDPOINT = "https://s3.amazonaws.com";
    process.env.SUPABASE_S3_ACCESS_KEY = "access-key";
    process.env.SUPABASE_S3_ACCESS_KEY_SECRET = "secret-key";

    const config = storageConfig();

    expect(config).toEqual({
      maxFileSize: 20971520,
      allowedFileTypes: ["jpg", "png", "pdf", "doc", "docx"],
      localStoragePath: undefined,
      s3Region: "us-east-1",
      s3Bucket: "my-bucket",
      s3Endpoint: "https://s3.amazonaws.com",
      s3AccessKey: "access-key",
      s3AccessKeySecret: "secret-key",
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.MAX_FILE_SIZE;
    delete process.env.ALLOWED_FILE_TYPES;
    delete process.env.LOCAL_STORAGE_PATH;

    const config = storageConfig();

    expect(config).toEqual({
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ["jpg", "png", "pdf", "doc", "docx"],
      localStoragePath: undefined,
      s3Region: undefined,
      s3Bucket: undefined,
      s3Endpoint: undefined,
      s3AccessKey: undefined,
      s3AccessKeySecret: undefined,
    });
  });

  it("should handle file types with spaces", () => {
    process.env.ALLOWED_FILE_TYPES = " jpg , png , pdf ";

    const config = storageConfig();

    expect(config.allowedFileTypes).toEqual(["jpg", "png", "pdf"]);
  });
});
