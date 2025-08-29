import { workflow } from "./manager";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

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
    const validationResult = await step.runMutation(
      internal.functions.internal.data.validateSource,
      { dataSourceId }
    );
    
    if (!validationResult.valid) {
      throw new Error(`Invalid data source: ${validationResult.error}`);
    }
    
    // Step 2: Extract data
    const extractedData = await step.runAction(
      internal.functions.actions.data.extractData,
      { dataSourceId },
      { 
        retry: { 
          maxAttempts: 3,
          backoffMs: [2000, 4000, 8000],
        },
      }
    );
    
    // Step 3: Process based on type
    let processedData;
    switch (processingType) {
      case "analysis":
        processedData = await step.runAction(
          internal.functions.actions.data.analyzeData,
          { data: extractedData, userId }
        );
        break;
        
      case "transformation":
        processedData = await step.runAction(
          internal.functions.actions.data.transformData,
          { data: extractedData, userId }
        );
        break;
        
      case "export":
        processedData = await step.runAction(
          internal.functions.actions.data.exportData,
          { data: extractedData, userId }
        );
        break;
    }
    
    // Step 4: Store results
    const resultId = await step.runMutation(
      internal.functions.internal.data.storeResults,
      { 
        userId,
        dataSourceId,
        processingType,
        results: processedData,
      }
    );
    
    // Step 5: Send notification
    await step.runAction(
      api.functions.actions.emails.sendNotificationEmail,
      {
        userId,
        email: await step.runQuery(
          internal.functions.queries.users.getUserEmail,
          { userId }
        ),
        subject: "Processing Complete",
        body: `Your ${processingType} job has completed successfully!`,
      }
    );
    
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
    const results = [];
    
    // Process items in batches of 10
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((item) =>
          step.runAction(
            internal.functions.actions.data.processItem,
            { userId, item, operation },
            { 
              retry: { 
                maxAttempts: 2,
              },
            }
          )
        )
      );
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid overwhelming the system
      if (i + batchSize < items.length) {
        await step.sleep(1000); // 1 second delay
      }
    }
    
    // Store batch results
    await step.runMutation(
      internal.functions.internal.data.storeBatchResults,
      { userId, operation, results }
    );
    
    return { 
      processedCount: results.length,
      successCount: results.filter(r => r.success).length,
    };
  },
});