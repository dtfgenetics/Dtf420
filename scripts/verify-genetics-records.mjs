import fs from "node:fs";
import path from "node:path";

const contentPath = path.join(process.cwd(), "content/genetics-projects.json");
const projects = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const errors = [];

if (!Array.isArray(projects) || projects.length === 0) {
  errors.push("genetics-projects.json must contain at least one project");
}

const slugs = new Set();
for (const project of Array.isArray(projects) ? projects : []) {
  if (typeof project.slug !== "string" || !project.slug.trim()) errors.push("Project is missing a slug");
  else if (slugs.has(project.slug)) errors.push(`Duplicate genetics project slug: ${project.slug}`);
  else slugs.add(project.slug);

  for (const field of ["name", "lineage", "status", "summary"]) {
    if (typeof project[field] !== "string" || !project[field].trim()) errors.push(`${project.slug ?? "unknown"} is missing ${field}`);
  }

  for (const field of ["traits", "selectionFocus", "parentRoles", "generationHistory", "relatedProjects", "milestones", "breedingNotes"]) {
    if (!Array.isArray(project[field])) errors.push(`${project.slug ?? "unknown"}.${field} must be an array`);
  }

  if (Array.isArray(project.parentRoles) && project.parentRoles.length < 2) {
    errors.push(`${project.slug} must preserve at least two parent-role records`);
  }

  if (Array.isArray(project.generationHistory) && project.generationHistory.length === 0) {
    errors.push(`${project.slug} must contain at least one generation-history record`);
  }
}

for (const project of Array.isArray(projects) ? projects : []) {
  for (const related of Array.isArray(project.relatedProjects) ? project.relatedProjects : []) {
    if (!slugs.has(related.slug)) errors.push(`${project.slug} references unknown related project: ${related.slug}`);
    if (related.slug === project.slug) errors.push(`${project.slug} cannot list itself as a related project`);
    if (typeof related.relationship !== "string" || !related.relationship.trim()) errors.push(`${project.slug} -> ${related.slug} is missing relationship context`);
  }

  for (const generation of Array.isArray(project.generationHistory) ? project.generationHistory : []) {
    if (![generation.label, generation.status, generation.notes].every((value) => typeof value === "string" && value.trim())) {
      errors.push(`${project.slug} contains an incomplete generation-history record`);
    }
  }

  for (const milestone of Array.isArray(project.milestones) ? project.milestones : []) {
    if (milestone.date !== null && (typeof milestone.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(milestone.date))) {
      errors.push(`${project.slug} has an invalid milestone date: ${milestone.date}`);
    }
    if (![milestone.label, milestone.detail].every((value) => typeof value === "string" && value.trim())) {
      errors.push(`${project.slug} contains an incomplete milestone record`);
    }
  }
}

if (errors.length) {
  console.error("Genetics record verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Genetics records verified: ${projects.length} projects, ${projects.reduce((sum, project) => sum + project.generationHistory.length, 0)} generation records, ${projects.reduce((sum, project) => sum + project.relatedProjects.length, 0)} project relationships.`);
