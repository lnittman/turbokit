import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';
// Breadcrumb for MDX snippets
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@repo/design/components/ui/breadcrumb';
// Prefer TurboKit design primitives, with light fallbacks if needed
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/design/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@repo/design/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    // Add custom components here
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Alert,
    AlertDescription,
    AlertTitle,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  };
}
