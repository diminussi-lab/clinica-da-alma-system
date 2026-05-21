import { describe, it, expect } from "vitest";
import { encryption, audit, dataRights, consent } from "./security";

describe("Security & LGPD Compliance", () => {
  describe("Encryption", () => {
    it("should encrypt and decrypt data correctly", () => {
      const plaintext = "Informação sensível do cliente";
      const encrypted = encryption.encrypt(plaintext);
      const decrypted = encryption.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should generate different ciphertexts for same plaintext", () => {
      const plaintext = "Teste de segurança";
      const encrypted1 = encryption.encrypt(plaintext);
      const encrypted2 = encryption.encrypt(plaintext);

      // Different IVs should produce different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
      expect(encryption.decrypt(encrypted1)).toBe(plaintext);
      expect(encryption.decrypt(encrypted2)).toBe(plaintext);
    });
  });

  describe("Audit Logging", () => {
    it("should log data access", async () => {
      const log = await audit.logDataAccess(
        "user-123",
        "therapeutic_record",
        "read",
        "record-456",
        "192.168.1.1"
      );

      expect(log).toHaveProperty("timestamp");
      expect(log.userId).toBe("user-123");
      expect(log.action).toBe("read");
    });

    it("should log consent", async () => {
      const log = await audit.logConsent(
        "user-123",
        "privacy_policy",
        "1.0",
        true
      );

      expect(log).toHaveProperty("timestamp");
      expect(log.accepted).toBe(true);
    });
  });

  describe("Data Rights", () => {
    it("should anonymize user data", async () => {
      const anonymized = await dataRights.anonymizeUserData("user-123");

      expect(anonymized.name).toBe("Usuário Anônimo");
      expect(anonymized.email).toContain("@anonymous.local");
      expect(anonymized.phone).toBeNull();
    });

    it("should handle deletion request", async () => {
      const deletion = await dataRights.deleteUserData("user-123");

      expect(deletion).toHaveProperty("userId");
      expect(deletion).toHaveProperty("timestamp");
      expect(deletion.status).toBe("pending");
    });

    it("should export user data", async () => {
      const exportData = await dataRights.exportUserData("user-123");

      expect(exportData).toHaveProperty("userId");
      expect(exportData).toHaveProperty("exportedAt");
      expect(exportData.data).toHaveProperty("profile");
      expect(exportData.data).toHaveProperty("sessions");
      expect(exportData.data).toHaveProperty("therapeuticRecords");
    });
  });

  describe("Consent Management", () => {
    it("should grant consent", async () => {
      const consentRecord = await consent.grantConsent(
        "user-123",
        "privacy_policy",
        "1.0"
      );

      expect(consentRecord).toHaveProperty("grantedAt");
      expect(consentRecord.consentType).toBe("privacy_policy");
    });

    it("should revoke consent", async () => {
      const revocation = await consent.revokeConsent(
        "user-123",
        "marketing_emails"
      );

      expect(revocation).toHaveProperty("revokedAt");
      expect(revocation.consentType).toBe("marketing_emails");
    });
  });

  describe("LGPD Compliance", () => {
    it("should have encryption enabled for sensitive data", () => {
      const sensitiveData = "Bloqueios emocionais: ansiedade, depressão";
      const encrypted = encryption.encrypt(sensitiveData);

      expect(encrypted).toContain(":");
      expect(encrypted.split(":")).toHaveLength(2);
      expect(encryption.decrypt(encrypted)).toBe(sensitiveData);
    });

    it("should support right to be forgotten", async () => {
      const deletion = await dataRights.deleteUserData("user-to-forget");
      expect(deletion.status).toBe("pending");
    });

    it("should support data portability", async () => {
      const exportData = await dataRights.exportUserData("user-123");
      expect(exportData.data).toBeDefined();
      expect(exportData).toHaveProperty("exportedAt");
    });
  });
});
