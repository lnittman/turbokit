import { workflow } from "./manager";
import { v } from "convex/values";
import { api, internal } from "../../_generated/api";
const anyApi = api as any;
const anyInternal = internal as any;

export const dataProcessingPipeline = workflow.define({
  args: {
    userId: v.id("users"),
    dataSourceId: v.string(),
    processingType: v.union(
      v.literal("analysis"),
      v.literal("transformation"),
      v.literal("export")
    ),
  },
  handler: async (step, { userId, dataSourceId, processingType }) => {
    // Step 1: Validate data source
    const validationResult = await step.runMutation(anyInternal.data.validateSource, { dataSourceId });
    
    if (!validationResult.valid) {
      throw new Error(`Invalid data source: ${validationResult.error}`);
    }
    
    // Step 2: Extract data
    const extractedData = await step.runAction(
      anyInternal.data.extractData,
      { dataSourceId },
      { retry: { maxAttempts: 3, initialBackoffMs: 2000, base: 2 } }
    );
    
    // Step 3: Process based on type
    let processedData;
    switch (processingType) {
      case "analysis":
        processedData = await step.runAction(anyInternal.data.analyzeData, { data: extractedData, userId });
        break;
        
      case "transformation":
        processedData = await step.runAction(anyInternal.data.transformData, { data: extractedData, userId });
        break;
        
      case "export":
        processedData = await step.runAction(anyInternal.data.exportData, { data: extractedData, userId });
        break;
    }
    
    // Step 4: Store results
    const resultId = await step.runMutation(anyInternal.data.storeResults, { userId, dataSourceId, processingType, results: processedData });
    
    // Step 5: Send notification
    await step.runAction(anyApi.app.emails.actions.sendNotificationEmail, { userId, email: await step.runQuery(anyInternal.app.users.getUserEmail, { userId }), subject: "Processing Complete", body: `Your ${processingType} job has completed successfully!` });
    
    return { resultId };
  },
});

// Workflow for batch processing multiple items
export const batchProcessing = workflow.define({
  args: {
    userId: v.id("users"),
    items: v.array(v.string()),
    operation: v.string(),
  },
  handler: async (step, { userId, items, operation }) => {
    const results: any[] = [];
    
    // Process items in batches of 10
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((item) =>
          step.runAction(
            anyInternal.data.processItem,
            { userId, item, operation },
            { retry: { maxAttempts: 2, initialBackoffMs: 500, base: 2 } }
          )
        )
      );
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid overwhelming the system
      // Optional throttling can be handled by Workpool or by scheduling follow-up work.
    }
    
    // Store batch results
    await step.runMutation(anyInternal.data.storeBatchResults, { userId, operation, results });
    
    return { processedCount: results.length } as any;
  },
});
