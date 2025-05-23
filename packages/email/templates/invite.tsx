import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Style,
  Tailwind,
  Text,
} from '@react-email/components';

interface InviteEmailProps {
  inviter?: string | null;
  title?: string | null;
  link?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';

// Approximate colors from your dark theme for email compatibility
const colors = {
  background: '#262833', // oklch(0.2 0.02 240)
  foreground: '#f0eee9', // oklch(0.94 0.01 60)
  card: '#2c2f3b',      // oklch(0.22 0.02 240)
  primary: '#e6e4dd',    // oklch(0.9 0.01 60) - Button Text
  primaryBg: '#383b4a',   // Slightly lighter bg for button contrast
  border: '#383b4a',      // oklch(0.28 0.02 240)
  mutedForeground: '#b8b6b0' // oklch(0.72 0.02 60)
};

export const InviteEmailTemplate = ({ 
  inviter = 'Someone', 
  title = 'a chat',
  link = baseUrl
}: InviteEmailProps) => {
  const previewText = `${inviter} invited you to join them on turbokit`;

  return (
    <Tailwind config={{
      theme: {
        extend: {
          colors,
          borderRadius: { DEFAULT: '0.5rem' }
        },
      },
    }}>
      <Html>
        <Head>
          <Style>
            {`
              @font-face {
                font-family: 'IosevkaTerm-Regular';
                src: url('https://intdev-global.s3.us-west-2.amazonaws.com/public/internet-dev/6397be61-3ea4-459d-8a3e-fd95168cb214.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
            `}
          </Style>
        </Head>
        <Preview>{previewText}</Preview>
        <Body style={{ backgroundColor: colors.background, fontFamily: 'IosevkaTerm-Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}>
          <Container className="mx-auto my-10 w-[465px] rounded-lg border border-solid p-6" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
            <Section className="mt-6 text-center">
              {/* Placeholder for a logo - adapt path if needed */}
              {/* <Img src={`${baseUrl}/logo-dark.png`} width="48" height="48" alt="arbor logo" className="mx-auto mb-6" /> */}
              <Heading className="mx-0 my-6 p-0 text-center text-2xl font-medium" style={{ color: colors.foreground }}>
                You're invited to join <strong style={{ color: colors.foreground }}>{title}</strong>
              </Heading>
            </Section>
            <Text style={{ color: colors.foreground, fontSize: '14px', lineHeight: '24px' }}>
              Hello,
            </Text>
            <Text style={{ color: colors.foreground, fontSize: '14px', lineHeight: '24px' }}>
              <strong style={{ color: colors.foreground }}>{inviter}</strong> has invited you to join them on turbokit.
            </Text>
            <Section className="my-8 text-center">
              <Button
                style={{ backgroundColor: colors.primaryBg, color: colors.primary, borderRadius: '0.5rem', fontWeight: 500, padding: '10px 18px', fontSize: '14px' }}
                href={link}
              >
                Join
              </Button>
            </Section>
            <Text style={{ color: colors.mutedForeground, fontSize: '12px', lineHeight: '20px' }}>
              If the button above doesn't work, copy and paste this URL into your browser:{' '}
              <Link href={link} style={{ color: colors.mutedForeground, textDecoration: 'underline' }}>
                {link}
              </Link>
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default InviteEmailTemplate; 