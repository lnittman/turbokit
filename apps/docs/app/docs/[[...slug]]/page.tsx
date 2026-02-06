import defaultMdxComponents from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { source } from "@/lib/source";
import { useMDXComponents } from "@/mdx-components";

export default async function Page(props: any): Promise<ReactElement> {
	const { params } = props;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const data: any = page.data as any;
	const MDX = data.body;

	const components = useMDXComponents(defaultMdxComponents as any);

	return (
		<DocsPage
			toc={data.toc}
			full={data.full}
			lastUpdate={data.lastModified}
			editOnGithub={{
				owner: "turbokit",
				repo: "turbokit",
				sha: "main",
				path: `docs/content/${page.file.path}`,
			}}
		>
			<DocsTitle>{data.title}</DocsTitle>
			<DocsDescription>{data.description}</DocsDescription>

			{/* badges removed for compatibility */}

			<DocsBody>
				<MDX components={components} />
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
