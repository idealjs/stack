import React from "react";
import Heading from "@theme/Heading";
import { courseSections } from "./courses";
import CourseCard from "./CourseCard";
import styles from "./styles.module.css";


export default function CourseShelf() {
  return (
    <section className={styles.shelf}>
      <Heading as="h2" className={styles.heading}>
        全栈工程师教程 · 课程书架
      </Heading>
      <p className={styles.subheading}>
        共 {courseSections.length} 个部分。悬停卡片，预览学完这一部分能得到什么。
      </p>
      <div className={styles.grid}>
        {courseSections.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
