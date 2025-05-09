import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { VercelDeployer } from '@mastra/deployer-vercel';

import { detectBookAgent } from './agents/example/books/detect-book';
import { executeSearchAgent } from './agents/example/books/execute-search';
import { getBookAgent } from './agents/example/books/get-book';
import { searchBooksAgent } from './agents/example/books/search-books';
import { planSearchAgent } from './agents/example/books/plan-search';
import { imageWorkflow } from './workflows/image';
import { textWorkflow } from './workflows/text';
import { textV2Workflow } from './workflows/text-v2';

// Create a logger with less verbose level to reduce output
const logger = createLogger({
  name: 'mastra',
  level: 'info'
});

// Create the Mastra instance with our components
export const mastra = new Mastra({
  agents: {
    detectBook: detectBookAgent,
    executeSearch: executeSearchAgent,
    getBook: getBookAgent,
    planSearch: planSearchAgent,
    searchBooks: searchBooksAgent,
  },
  deployer: new VercelDeployer({
    projectName: 'books-ai',
    teamSlug: 'luke-labs',
    token: process.env.VERCEL_TOKEN || '',
  }),
  logger,
  workflows: {
    image: imageWorkflow,
    text: textWorkflow,
    textV2: textV2Workflow,
  },
});