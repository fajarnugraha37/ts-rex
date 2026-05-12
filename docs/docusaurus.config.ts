import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "TypeScript Regular Expressions (TS-Rex)",
  tagline: "Drizzle-inspired, fluent-API Regex builder for modern TypeScript. Automatically infers named capture group types, ensures stateless execution, and supports the latest ES2024 features including Unicode sets.",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https:/nugrahafajar.my.id",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/ts-rex/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "fajarnugraha37", // Usually your GitHub org/user name.
  projectName: "ts-rex", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/fajarnugraha37/ts-rex",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/fajarnugraha37/ts-rex",
          // Useful options to enforce blogging best practices
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

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: "light",
    },
    navbar: {
      title: "TS-Rex",
      logo: {
        alt: "TS-Rex Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documentation",
        },
        { 
          to: "/docs/category/examples", 
          label: "Examples", 
          position: "left" 
        },
        {
          href: "https://github.com/fajarnugraha37/ts-rex",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Documentation",
              to: "/docs/intro",
            },
            {
              label: "Examples",
              to: "/docs/category/examples",
            },
            {
              label: "API References",
              to: "/docs/category/api-references",
            },
          ],
        },
        {
          title: "Social Media",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/fajarnugraha37",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/fajar-abdi-nugraha-81b26618a/",
            },
            {
              label: "Instagram",
              href: "https://www.instagram.com/fajarnugraha37/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Examples",
              to: "/docs/category/examples",
            },
            {
              label: "GitHub",
              href: "https://github.com/fajarnugraha37/ts-rex",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TS-Rex. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
