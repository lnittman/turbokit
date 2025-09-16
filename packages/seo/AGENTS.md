# SEO Package - AI Agent Instructions

## Overview
This package provides comprehensive SEO utilities for TurboKit applications, including metadata generation, JSON-LD structured data, and social media optimization. It ensures consistent SEO implementation across all apps with type-safe APIs.

## Quick Start Checklist
- [ ] Configure base metadata in your app
- [ ] Add JSON-LD structured data
- [ ] Set up Open Graph images
- [ ] Configure Twitter cards
- [ ] Implement dynamic metadata
- [ ] Add canonical URLs
- [ ] Set up sitemap generation

## Architecture

### Package Structure
```
packages/seo/
├── metadata.ts    # Next.js metadata generation
├── json-ld.tsx    # Structured data component
└── package.json   # Dependencies
```

### Core Components

#### 1. Metadata Generator (`metadata.ts`)
- Creates consistent Next.js metadata objects
- Handles Open Graph and Twitter cards
- Manages default values and overrides
- Supports dynamic metadata generation

#### 2. JSON-LD Component (`json-ld.tsx`)
- Type-safe structured data with schema-dts
- Supports all Schema.org types
- Improves search engine understanding
- Enhances rich snippets

## Basic Usage

### Setting Up Metadata

```typescript
// apps/app/src/app/layout.tsx
import { createMetadata } from '@repo/seo/metadata';

export const metadata = createMetadata({
  title: 'Your App Name',
  description: 'Your app description for search engines',
  image: '/og-image.png', // Optional: Open Graph image
});
```

### Page-Specific Metadata

```typescript
// apps/app/src/app/about/page.tsx
import { createMetadata } from '@repo/seo/metadata';

export const metadata = createMetadata({
  title: 'About Us',
  description: 'Learn more about our company and mission',
  // Inherits defaults from createMetadata
});
```

### Dynamic Metadata

```typescript
// apps/app/src/app/products/[id]/page.tsx
import { createMetadata } from '@repo/seo/metadata';

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  return createMetadata({
    title: product.name,
    description: product.description,
    image: product.image,

    // Additional Open Graph data
    openGraph: {
      type: 'product',
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ],
      // Product-specific data
      tags: product.categories,
    },
  });
}
```

## Customizing Metadata

### Update Default Values

```typescript
// packages/seo/metadata.ts - Update these constants
const applicationName = 'YourAppName';

const author: Metadata['authors'] = {
  name: 'Your Name',
  url: 'https://your-website.com',
};

const publisher = 'Your Company';
const twitterHandle = '@yourhandle';
```

### Environment-Based URL

```typescript
// Automatic URL detection from Vercel
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

// Or use custom URL
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                 `${protocol}://${productionUrl}`;
```

### Extended Metadata Options

```typescript
import { createMetadata } from '@repo/seo/metadata';

export const metadata = createMetadata({
  title: 'Page Title',
  description: 'Page description',

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: 'https://example.com/page',
    languages: {
      'en-US': 'https://example.com/en-US',
      'de-DE': 'https://example.com/de-DE',
    },
  },

  // Verification tags
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },

  // Additional meta tags
  other: {
    'fb:app_id': 'your-facebook-app-id',
    'apple-itunes-app': 'app-id=myAppStoreID',
  },
});
```

## JSON-LD Structured Data

### Basic Implementation

```typescript
// apps/app/src/app/page.tsx
import { JsonLd, type Organization } from '@repo/seo/json-ld';

export default function HomePage() {
  const organizationData: Organization = {
    '@type': 'Organization',
    name: 'Your Company',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/yourcompany',
      'https://github.com/yourcompany',
      'https://linkedin.com/company/yourcompany',
    ],
  };

  return (
    <>
      <JsonLd code={{
        '@context': 'https://schema.org',
        ...organizationData,
      }} />
      {/* Page content */}
    </>
  );
}
```

### Product Schema

```typescript
import { JsonLd, type Product } from '@repo/seo/json-ld';

function ProductPage({ product }) {
  const productSchema: Product = {
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Your Store',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <JsonLd code={{
        '@context': 'https://schema.org',
        ...productSchema,
      }} />
      {/* Product details */}
    </>
  );
}
```

### Article Schema

```typescript
import { JsonLd, type Article } from '@repo/seo/json-ld';

function BlogPost({ post }) {
  const articleSchema: Article = {
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd code={{
        '@context': 'https://schema.org',
        ...articleSchema,
      }} />
      <article>{/* Post content */}</article>
    </>
  );
}
```

### Breadcrumb Schema

```typescript
import { JsonLd, type BreadcrumbList } from '@repo/seo/json-ld';

function PageWithBreadcrumbs({ breadcrumbs }) {
  const breadcrumbSchema: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <JsonLd code={{
        '@context': 'https://schema.org',
        ...breadcrumbSchema,
      }} />
      {/* Page content */}
    </>
  );
}
```

### FAQ Schema

```typescript
import { JsonLd, type FAQPage } from '@repo/seo/json-ld';

function FAQSection({ faqs }) {
  const faqSchema: FAQPage = {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd code={{
        '@context': 'https://schema.org',
        ...faqSchema,
      }} />
      {/* FAQ content */}
    </>
  );
}
```

## Open Graph Optimization

### Basic Open Graph

```typescript
export const metadata = createMetadata({
  title: 'Page Title',
  description: 'Description',

  openGraph: {
    title: 'OG Title (can be different)',
    description: 'OG Description',
    url: 'https://example.com/page',
    siteName: 'Your Site Name',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Description of image',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
});
```

### Dynamic OG Images

```typescript
// Using @vercel/og for dynamic images
// apps/app/src/app/api/og/route.tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Default Title';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

// Use in metadata
export const metadata = createMetadata({
  title: 'Dynamic Page',
  description: 'Description',
  image: '/api/og?title=Dynamic+Page',
});
```

## Twitter Cards

### Summary Card

```typescript
export const metadata = createMetadata({
  title: 'Page Title',
  description: 'Description',

  twitter: {
    card: 'summary',
    title: 'Twitter Title',
    description: 'Twitter Description',
    creator: '@creator',
    site: '@site',
    images: ['https://example.com/image.png'],
  },
});
```

### Large Image Card

```typescript
export const metadata = createMetadata({
  title: 'Page Title',
  description: 'Description',

  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
    images: [
      {
        url: 'https://example.com/large-image.png',
        alt: 'Image description',
      }
    ],
  },
});
```

## Advanced Patterns

### SEO Component Wrapper

```typescript
// packages/seo/seo-wrapper.tsx
import { JsonLd } from './json-ld';
import type { Thing, WithContext } from 'schema-dts';

interface SEOWrapperProps {
  children: React.ReactNode;
  structuredData?: WithContext<Thing>;
}

export function SEOWrapper({ children, structuredData }: SEOWrapperProps) {
  return (
    <>
      {structuredData && <JsonLd code={structuredData} />}
      {children}
    </>
  );
}
```

### Metadata Factory

```typescript
// packages/seo/metadata-factory.ts
import { createMetadata as baseCreateMetadata } from './metadata';

interface MetadataConfig {
  titleTemplate?: string;
  defaultDescription?: string;
  defaultImage?: string;
}

export function createMetadataFactory(config: MetadataConfig) {
  return function createMetadata(options: Parameters<typeof baseCreateMetadata>[0]) {
    const title = config.titleTemplate
      ? config.titleTemplate.replace('%s', options.title)
      : options.title;

    return baseCreateMetadata({
      ...options,
      title,
      description: options.description || config.defaultDescription || '',
      image: options.image || config.defaultImage,
    });
  };
}

// Usage
const createAppMetadata = createMetadataFactory({
  titleTemplate: '%s | Your App',
  defaultDescription: 'Default app description',
  defaultImage: '/default-og.png',
});
```

### Multi-Language SEO

```typescript
// packages/seo/i18n-metadata.ts
import { createMetadata } from './metadata';

export function createI18nMetadata(locale: string, translations: Record<string, any>) {
  return createMetadata({
    title: translations[locale].title,
    description: translations[locale].description,

    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: Object.keys(translations).reduce((acc, lang) => ({
        ...acc,
        [lang]: `https://example.com/${lang}`,
      }), {}),
    },

    openGraph: {
      locale: locale.replace('-', '_'),
      alternateLocale: Object.keys(translations)
        .filter(l => l !== locale)
        .map(l => l.replace('-', '_')),
    },
  });
}
```

## Sitemap Generation

```typescript
// apps/app/src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://example.com';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (e.g., from database)
  const posts = await getPosts();
  const dynamicRoutes = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
```

## Robots.txt Configuration

```typescript
// apps/app/src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://example.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

## Best Practices

### 1. Title Optimization
- Keep titles under 60 characters
- Include primary keyword near the beginning
- Make each page title unique
- Use title templates for consistency

### 2. Description Optimization
- Keep descriptions between 150-160 characters
- Include call-to-action when appropriate
- Make descriptions compelling and unique
- Avoid keyword stuffing

### 3. Image Optimization
- Use 1200x630px for Open Graph images
- Optimize file size (under 200KB ideal)
- Include text overlay for context
- Test appearance on social platforms

### 4. Structured Data
- Validate with Google's Rich Results Test
- Use appropriate schema types
- Include all required properties
- Keep data accurate and up-to-date

### 5. URL Structure
- Use canonical URLs to avoid duplicates
- Implement proper redirects
- Keep URLs short and descriptive
- Use hyphens to separate words

## Testing & Validation

### Metadata Testing

```typescript
// __tests__/metadata.test.ts
import { createMetadata } from '@repo/seo/metadata';

describe('Metadata generation', () => {
  it('creates valid metadata object', () => {
    const metadata = createMetadata({
      title: 'Test Title',
      description: 'Test Description',
    });

    expect(metadata.title).toBe('Test Title');
    expect(metadata.description).toBe('Test Description');
    expect(metadata.openGraph?.title).toBe('Test Title');
  });

  it('includes image in Open Graph', () => {
    const metadata = createMetadata({
      title: 'Test',
      description: 'Test',
      image: '/test.png',
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: '/test.png',
        width: 1200,
        height: 630,
        alt: 'Test',
      },
    ]);
  });
});
```

### Structured Data Validation

```typescript
// Use schema-dts for type checking
import { JsonLd, type Product } from '@repo/seo/json-ld';

// TypeScript will validate schema structure
const productData: Product = {
  '@type': 'Product',
  name: 'Product Name',
  // Missing required fields will cause type error
};
```

### Tools for Testing
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
5. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

## Common Issues & Solutions

### Metadata Not Updating
```typescript
// Force cache revalidation
export const revalidate = 60; // Revalidate every 60 seconds

// Or use dynamic mode
export const dynamic = 'force-dynamic';
```

### Missing Open Graph Image
```typescript
// Check image path is absolute or valid URL
image: process.env.NODE_ENV === 'production'
  ? 'https://example.com/og.png'
  : '/og.png'
```

### JSON-LD Not Rendering
```typescript
// Ensure component is in page body
return (
  <>
    <JsonLd code={structuredData} />
    <main>{/* Content */}</main>
  </>
);
```

### Duplicate Metadata
```typescript
// Use template for consistent base metadata
const baseMetadata = createMetadata({
  title: 'Default',
  description: 'Default',
});

// Override specific fields only
export const metadata = {
  ...baseMetadata,
  title: 'Specific Page Title',
};
```

## Migration Guide

### From Next.js 12 to 13+
```typescript
// Before: _document.tsx with Head
import Head from 'next/head';

<Head>
  <title>Title</title>
  <meta name="description" content="Description" />
</Head>

// After: Metadata API
export const metadata = createMetadata({
  title: 'Title',
  description: 'Description',
});
```

### From React Helmet
```typescript
// Before: React Helmet
<Helmet>
  <title>Title</title>
  <meta property="og:title" content="Title" />
</Helmet>

// After: Next.js Metadata
export const metadata = createMetadata({
  title: 'Title',
  openGraph: { title: 'Title' },
});
```

## Environment Variables
No specific environment variables required, but these are commonly used:

```env
# Base URL for metadata
NEXT_PUBLIC_APP_URL=https://example.com

# Social media handles
NEXT_PUBLIC_TWITTER_HANDLE=@yourhandle
NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id

# Verification codes
GOOGLE_SITE_VERIFICATION=verification-code
```

## Key Files
- `metadata.ts` - Metadata generation utility
- `json-ld.tsx` - JSON-LD structured data component
- `package.json` - Dependencies

## TurboKit Conventions
- Centralized SEO configuration
- Type-safe metadata generation
- Consistent structured data implementation
- Social media optimization by default
- Automatic URL detection from environment
- Extensible and customizable for each app