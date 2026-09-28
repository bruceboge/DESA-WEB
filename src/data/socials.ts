export interface SocialLink {
  name: string;
  handle: string;
  subtitle?: string;
  url: string;
  ariaLabel: string;
}

export const DESA_SOCIALS: SocialLink[] = [
  {
    name: "TikTok",
    handle: "desa_dekut",
    subtitle: "Official TikTok",
    url: "https://www.tiktok.com/@desa_dekut",
    ariaLabel: "Follow DESA DeKUT on TikTok @desa_dekut",
  },
  {
    name: "LinkedIn",
    handle: "DESA",
    subtitle: "DeKUT Engineering Students Association",
    url: "https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5",
    ariaLabel: "Connect with DESA on LinkedIn",
  },
  {
    name: "Instagram",
    handle: "dekut_engineeringstudents",
    subtitle: "Official Instagram",
    url: "https://www.instagram.com/dekut_engineeringstudents",
    ariaLabel: "Follow DESA on Instagram @dekut_engineeringstudents",
  },
];
