import { describe, expect, it } from "vitest";
import { api, internal } from "../convex/_generated/api";
import { createTestContext, withTestImageJob, withTestUser } from "./setup";

describe("images domain", () => {
  // Note: startGeneration tests are skipped because they schedule actions
  // which cause unhandled rejection issues in convex-test.
  // The mutation is tested indirectly through the internal function tests.
  describe("mutations.startGeneration", () => {
    it("requires authentication", async () => {
      const t = createTestContext();

      // Without auth - should throw
      await expect(
        t.mutation(api.app.images.mutations.startGeneration, {
          prompt: "Test",
        })
      ).rejects.toThrow();
    });
  });

  describe("queries.getJob", () => {
    it("returns job for owner", async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const jobId = await withTestImageJob(t, userId, {
        prompt: "Test prompt",
      });

      const asUser = t.withIdentity({ subject: clerkId });
      const job = await asUser.query(api.app.images.queries.getJob, { jobId });

      expect(job).toBeDefined();
      expect(job?.prompt).toBe("Test prompt");
    });

    it("returns null for non-owner", async () => {
      const t = createTestContext();
      const { userId: ownerId } = await withTestUser(t, {
        email: "owner@test.com",
      });
      const { clerkId: otherClerkId } = await withTestUser(t, {
        email: "other@test.com",
      });

      const jobId = await withTestImageJob(t, ownerId);

      const asOther = t.withIdentity({ subject: otherClerkId });
      const job = await asOther.query(api.app.images.queries.getJob, { jobId });

      expect(job).toBeNull();
    });
  });

  describe("queries.listJobs", () => {
    it("lists only user's own jobs", async () => {
      const t = createTestContext();
      const { userId: user1Id, clerkId: user1ClerkId } = await withTestUser(t, {
        email: "user1@test.com",
      });
      const { userId: user2Id, clerkId: user2ClerkId } = await withTestUser(t, {
        email: "user2@test.com",
      });

      // Create jobs for both users
      await withTestImageJob(t, user1Id, { prompt: "User 1 job" });
      await withTestImageJob(t, user2Id, { prompt: "User 2 job" });

      // User 1 should only see their own job
      const asUser1 = t.withIdentity({ subject: user1ClerkId });
      const user1Jobs = await asUser1.query(
        api.app.images.queries.listJobs,
        {}
      );

      expect(user1Jobs).toHaveLength(1);
      expect(user1Jobs[0].prompt).toBe("User 1 job");
    });
  });

  describe("internal.updateJobStatus", () => {
    it("updates job status", async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      const jobId = await withTestImageJob(t, userId, { status: "queued" });

      await t.mutation(internal.app.images.internal.updateJobStatus, {
        jobId,
        status: "processing",
        attempts: 1,
      });

      const job = await t.run(async (ctx) => ctx.db.get(jobId));
      expect(job?.status).toBe("processing");
      expect(job?.attempts).toBe(1);
    });
  });

  describe("internal.completeJob", () => {
    it("marks job as completed with result", async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      const jobId = await withTestImageJob(t, userId);

      await t.mutation(internal.app.images.internal.completeJob, {
        jobId,
        result: {
          url: "https://example.com/image.png",
          width: 1024,
          height: 1024,
        },
      });

      const job = await t.run(async (ctx) => ctx.db.get(jobId));
      expect(job?.status).toBe("completed");
      expect(job?.result?.url).toBe("https://example.com/image.png");
      expect(job?.completedAt).toBeDefined();
    });
  });

  describe("internal.failJob", () => {
    it("marks job as failed with error", async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      const jobId = await withTestImageJob(t, userId);

      await t.mutation(internal.app.images.internal.failJob, {
        jobId,
        error: "Generation failed: API error",
      });

      const job = await t.run(async (ctx) => ctx.db.get(jobId));
      expect(job?.status).toBe("failed");
      expect(job?.error).toBe("Generation failed: API error");
    });
  });
});
