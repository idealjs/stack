import React, { useState } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { CourseSection } from "./courses";
import styles from "./styles.module.css";

/**
 * 单张课程卡：静态展示 title/desc/done/relations，
 * hover（或键盘 focus）时挂载 GIF——"学完能得到什么"的动态预告。
 * GIF 只在首次 hover 时加载，避免首屏拉全部动图。
 */
export default function CourseCard({ course }: { course: CourseSection }) {
  const [previewing, setPreviewing] = useState(false);
  const gifUrl = useBaseUrl(`gifs/${course.id}.gif`);

  return (
    <Link
      to={course.href}
      className={clsx("card", styles.card)}
      style={{ ["--course-color" as string]: course.color }}
      onMouseEnter={() => setPreviewing(true)}
      onMouseLeave={() => setPreviewing(false)}
      onFocus={() => setPreviewing(true)}
      onBlur={() => setPreviewing(false)}
    >
      <div className={styles.spine} aria-hidden="true" />

      <div className={styles.media}>
        {previewing ? (
          <img
            className={styles.gif}
            src={gifUrl}
            alt={`${course.title} 学完后的预期成果演示`}
            loading="eager"
          />
        ) : (
          <div className={styles.mediaHint}>
            <span className={styles.mediaHintIcon}>{"\u25B6"}</span>
            悬停预览预期成果
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{course.title}</h3>
          <span
            className={clsx(
              styles.doneFlag,
              course.done ? styles.done : styles.wip,
            )}
            title={course.done ? "已完成" : "写作中"}
          >
            {course.done ? "✓ 已完成" : "写作中"}
          </span>
        </div>

        <p className={styles.description}>{course.description}</p>

        <div className={styles.relations}>
          {course.relations.length > 0 ? (
            course.relations.map((r) => (
              <span key={r} className={styles.relationChip}>
                {r}
              </span>
            ))
          ) : (
            <span className={styles.relationEmpty}>关联章节整理中</span>
          )}
        </div>
      </div>
    </Link>
  );
}
