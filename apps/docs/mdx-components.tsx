import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';
// Lightweight MDX component fallbacks used by docs content
function Accordion(props: any) { return <div {...props} /> }
function AccordionItem(props: any) { return <div {...props} /> }
function AccordionTrigger(props: any) { return <h4 {...props} /> }
function AccordionContent(props: any) { return <div {...props} /> }

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    // Add custom components here
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  };
}
