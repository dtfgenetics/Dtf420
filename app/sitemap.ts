import type { MetadataRoute } from "next";
import academyCourses from "@/content/academy-courses.json";
import atlasModules from "@/content/atlas-learning-modules.json";
import plantHealthCore from "@/content/plant-health-library.json";
import plantHealthExpanded from "@/content/plant-health-expanded.json";
import plantHealthAbiotic from "@/content/plant-health-abiotic-expanded.json";
import plantHealthIpmExpanded from "@/content/plant-health-ipm-expanded.json";
import cultivationCore from "@/content/cultivation-science-library.json";
import protectedCultivation from "@/content/protected-cultivation-library.json";
import protectedLighting from "@/content/protected-cultivation-lighting.json";
import outdoorExpanded from "@/content/outdoor-cultivation-expanded.json";
import postharvestExpanded from "@/content/postharvest-science-expanded.json";
import advancedExpanded from "@/content/advanced-cultivation-science-expanded.json";
import plantPhysiologyExpanded from "@/content/plant-physiology-expanded.json";
import propagationNutritionGenetics from "@/content/propagation-nutrition-genetics-expanded.json";
import symptomCore from "@/content/symptom-differential-library.json";
import symptomExpanded from "@/content/symptom-differential-expanded.json";
import learningTools from "@/content/learning-tools.json";
import educationSops from "@/content/education-sops.json";
import geneticsProjects from "@/content/genetics-projects.json";
import communityGrowOffs from "@/content/community-growoffs.json";

export const dynamic = "force-static";

const BASE_URL = "https://dtfseeds.com";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function item(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  } satisfies MetadataRoute.Sitemap[number];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    item("/", 1, "weekly"),
    item("/seeds", 0.95, "weekly"),
    item("/learn", 0.95, "weekly"),
    item("/learn/academy", 0.92, "weekly"),
    item("/learn/search", 0.85, "weekly"),
    item("/learn/glossary", 0.84, "weekly"),
    item("/learn/sops", 0.86, "weekly"),
    item("/learn/sources", 0.82, "weekly"),
    item("/learn/atlas", 0.95, "weekly"),
    item("/learn/plant-health", 0.9, "weekly"),
    item("/learn/symptoms", 0.9, "weekly"),
    item("/learn/cultivation-science", 0.9, "weekly"),
    item("/learn/tools", 0.85, "weekly"),
    item("/learn/atlas/cases", 0.8, "monthly"),
    item("/learn/atlas/practice", 0.8, "monthly"),
    item("/learn/atlas/review", 0.75, "monthly"),
    item("/learn/atlas/mastery", 0.7, "monthly"),
    item("/learn/atlas/paths", 0.75, "monthly"),
    item("/tools", 0.85, "weekly"),
    item("/tools/growlens", 0.78, "monthly"),
    item("/tools/grow-doc", 0.78, "monthly"),
    item("/games", 0.8, "weekly"),
    item("/games/weedopolis", 0.82, "weekly"),
    item("/games/bud-or-bluff", 0.82, "weekly"),
    item("/games/seed-ascent", 0.82, "weekly"),
    item("/games/thc-rpg", 0.82, "weekly"),
    item("/games/strain-showdown", 0.7, "weekly"),
    item("/games/phenoquest", 0.7, "weekly"),
    item("/games/burn-buds", 0.7, "weekly"),
    item("/community", 0.7, "monthly"),
    item("/community/grow-offs", 0.74, "monthly"),
    item("/journal", 0.72, "weekly"),
    item("/about", 0.62, "monthly"),
    item("/contact", 0.65, "monthly"),
  ];

  const genetics = geneticsProjects.map((project) => item(`/seeds/${project.slug}`, 0.82, "monthly"));
  const academy = academyCourses.map((course) => item(`/learn/academy/${course.slug}`, 0.82, "monthly"));

  const plantHealth = [...plantHealthCore, ...plantHealthExpanded, ...plantHealthAbiotic, ...plantHealthIpmExpanded].map((entry) =>
    item(`/learn/plant-health/${entry.slug}`, 0.78, "monthly"),
  );

  const cultivation = [
    ...cultivationCore,
    ...protectedCultivation,
    ...protectedLighting,
    ...outdoorExpanded,
    ...postharvestExpanded,
    ...advancedExpanded,
    ...plantPhysiologyExpanded,
    ...propagationNutritionGenetics,
  ].map((entry) => item(`/learn/cultivation-science/${entry.slug}`, 0.78, "monthly"));

  const symptoms = [...symptomCore, ...symptomExpanded].map((entry) => item(`/learn/symptoms/${entry.slug}`, 0.8, "monthly"));
  const tools = learningTools.map((entry) => item(`/learn/tools/${entry.slug}`, 0.7, "monthly"));
  const sops = educationSops.map((entry) => item(`/learn/sops/${entry.slug}`, 0.74, "monthly"));
  const growOffs = communityGrowOffs.map((entry) => item(`/community/grow-offs/${entry.slug}`, 0.7, "monthly"));

  const atlasRoutes = atlasModules.flatMap((atlasModule) => {
    const systemSlug = slugify(atlasModule.id);
    return [
      item(`/learn/atlas/${systemSlug}`, 0.82, "monthly"),
      ...atlasModule.lessons.map((lesson) => item(`/learn/atlas/${systemSlug}/${slugify(lesson.title)}`, 0.75, "monthly")),
    ];
  });

  const all = [...staticRoutes, ...genetics, ...academy, ...plantHealth, ...cultivation, ...symptoms, ...tools, ...sops, ...growOffs, ...atlasRoutes];
  const unique = new Map(all.map((entry) => [entry.url, entry]));
  return [...unique.values()];
}
