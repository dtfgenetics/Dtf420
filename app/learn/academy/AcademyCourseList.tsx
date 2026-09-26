"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import courses from "@/content/academy-courses.json";
import styles from "./page.module.css";

export default function AcademyCourseList() {
  const courseSlugs = useMemo(() => courses.map((course) => course.slug), []);
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(courseSlugs));

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const sync = () => {
      const isMobile = query.matches;
      setMobile(isMobile);
      setExpanded((current) => {
        if (!isMobile) return new Set(courseSlugs);
        if (current.size === courseSlugs.length) return new Set(courseSlugs.slice(0, 1));
        return current;
      });
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [courseSlugs]);

  const toggle = (slug: string) => {
    if (!mobile) return;
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className={styles.courseList} id="guided-courses">
      {courses.map((course, courseIndex) => {
        const isExpanded = expanded.has(course.slug);
        const panelId = `academy-course-${course.slug}`;
        return (
          <section className={styles.course} id={course.slug} key={course.slug}>
            <header className={styles.courseHeader}>
              <div>
                <span className={styles.courseNumber}>Course {String(courseIndex + 1).padStart(2, "0")}</span>
                <h2>{course.title}</h2>
                <p>{course.summary}</p>
              </div>
              <div className={styles.courseActions}>
                <Link className={styles.startLink} href={`/learn/academy/${course.slug}`}>Open course →</Link>
                <button
                  className={styles.courseToggle}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => toggle(course.slug)}
                >
                  <span>{isExpanded ? "Hide units" : "Show units"}</span>
                  <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                </button>
              </div>
            </header>

            <div className={styles.units} id={panelId} hidden={!isExpanded}>
              {course.units.map((unit, unitIndex) => (
                <Link className={styles.unit} href={unit.href} key={`${course.slug}-${unit.title}`}>
                  <span className={styles.unitIndex}>{unitIndex + 1}</span>
                  <span className={styles.unitText}>
                    <strong>{unit.title}</strong>
                    <span>{unit.description}</span>
                  </span>
                  <span className={styles.open}>Open →</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
