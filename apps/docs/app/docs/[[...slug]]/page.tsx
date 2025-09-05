import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Badge } from '@repo/design/components/ui/badge';

export default async function Page(props: any) {
  const { params } = props;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const data: any = page.data as any;
  const MDX = data.body;

  return (
    <DocsPage
      toc={data.toc}
      full={data.full}
      lastUpdate={data.lastModified}
      editOnGithub={{
        owner: 'turbokit',
        repo: 'turbokit',
        sha: 'main',
        path: `docs/content/${page.file.path}`,
      }}
    >
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      
      {/* Display category and difficulty badges */}
      <div className="flex gap-2 mb-6">
        {data.category && (
          <Badge className={`badge-${data.category}`}>
            {data.category}
          </Badge>
        )}
        {data.difficulty && (
          <Badge variant="outline">
            {data.difficulty}
          </Badge>
        )}
      </div>
      
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: any) {
  const { params } = props;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
