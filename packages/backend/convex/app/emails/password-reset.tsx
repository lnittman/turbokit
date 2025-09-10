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
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
  projectName?: string;
}

export default function PasswordResetEmail({
  name,
  resetLink,
  projectName = "TurboKit",
}: PasswordResetEmailProps) {
  const previewText = `Reset your ${projectName} password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Reset Request</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            We received a request to reset your password for your {projectName} account.
            Click the button below to create a new password.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>{resetLink}</Text>
          
          <Text style={text}>
            This link will expire in 1 hour for security reasons. If you didn't request
            a password reset, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            — The {projectName} Security Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
  padding: "0 48px",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
  padding: "0 48px",
};

const buttonContainer = {
  padding: "0 48px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const linkText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 20px",
  padding: "0 48px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
  padding: "0 48px",
};