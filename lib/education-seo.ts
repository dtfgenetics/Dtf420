import type { Metadata } from "next";

export const EDUCATION_SITE_URL = "https://dtfseeds.com";

export function buildEducationMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      siteName: "DTF420",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildLearningResourceJsonLd({
  name,
  description,
  path,
  learningResourceType,
  about,
}: {
  name: string;
  description: string;
  path: string;
  learningResourceType: string;
  about?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name,
    description,
    url: `${EDUCATION_SITE_URL}${path}`,
    isAccessibleForFree: true,
    learningResourceType,
    ...(about ? { about } : {}),
    provider: {
      "@type": "Organization",
      name: "Teaching Healthy Cultivation",
      url: `${EDUCATION_SITE_URL}/learn`,
    },
  };
}
