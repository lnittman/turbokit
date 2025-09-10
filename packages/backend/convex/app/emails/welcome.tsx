import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  projectName?: string;
}

export default function WelcomeEmail({
  name,
  projectName = "TurboKit",
}: WelcomeEmailProps) {
  const previewText = `Welcome to ${projectName}, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://turbokit.dev/logo.png"
              width="120"
              height="40"
              alt={projectName}
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Welcome aboard, {name}!</Heading>
          
          <Text style={text}>
            We're thrilled to have you join {projectName}. Your account is all set up and ready to go.
          </Text>
          
          <Section style={buttonContainer}>
            <Button
              style={button}
              href="https://app.turbokit.dev/dashboard"
            >
              Get Started
            </Button>
          </Section>
          
          <Text style={text}>
            Here are some things you can do to get started:
          </Text>
          
          <Section style={listContainer}>
            <Text style={listItem}>✓ Complete your profile</Text>
            <Text style={listItem}>✓ Create your first project</Text>
            <Text style={listItem}>✓ Explore our documentation</Text>
            <Text style={listItem}>✓ Connect with our community</Text>
          </Section>
          
          <Text style={text}>
            If you have any questions or need assistance, don't hesitate to{" "}
            <Link href="https://turbokit.dev/support" style={link}>
              reach out to our support team
            </Link>
            .
          </Text>
          
          <Text style={footer}>
            Best regards,
            <br />
            The {projectName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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

const logoContainer = {
  padding: "32px 20px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
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
  backgroundColor: "#5469d4",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const listContainer = {
  padding: "0 48px",
  margin: "0 0 32px",
};

const listItem = {
  color: "#555",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px",
};

const link = {
  color: "#5469d4",
  textDecoration: "underline",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
  padding: "0 48px",
};