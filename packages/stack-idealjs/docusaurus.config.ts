import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";



const config: Config = {
  title: "stack idealjs",
  tagline: "分享你的内容",
  favicon: "img/favicon.ico",

  
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  
  url: "https://stack.idealjs.com",
  
  
  baseUrl: "/",

  
  
  organizationName: "idealjs", // Usually your GitHub org/user name.
  projectName: "stack-idealjs", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  
  
  
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          
          
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          
          
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "tools",
        path: "tools",
        routeBasePath: "tools",
        sidebarPath: "./sidebarsTools.ts",
        editUrl:
          "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "practice",
        path: "practice",
        routeBasePath: "practice",
        sidebarPath: "./sidebarsPractice.ts",
        editUrl:
          "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
      },
    ],
  ],

  themeConfig: {
    
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "stack idealjs",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "全栈教程",
        },
        {
          type: "docSidebar",
          sidebarId: "toolsSidebar",
          docsPluginId: "tools",
          position: "left",
          label: "工具使用",
        },
        {
          type: "docSidebar",
          sidebarId: "practiceSidebar",
          docsPluginId: "practice",
          position: "left",
          label: "实践经历",
        },
        { to: "/blog", label: "博客", position: "left" },
        {
          href: "https://github.com/idealjs/stack",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} idealjs.com. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
