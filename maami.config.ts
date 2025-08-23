import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const MaamiConfig: Configuration = {
  title: "Sollungo Maami",
  subTitle: "Bhikshaam Dehi Cha Paarvati",
  brandTitle: "Sollungo Maami",

  description: "Blog Site",

  site: "https://sollungomaami.vercel.app",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/about",
    },
    {
      nameKey: I18nKeys.nav_bar_youtube,
      href: "https://www.youtube.com/@sollungomaami924",
    },
  ],

  username: "Sollungo Maami",
  sign: "Har Har Mahadev",
  avatarUrl: "https://raw.githubusercontent.com/AkshayNarayananB/SollungoMaami/master/images/ninceyard.jpg",
  socialLinks: [
    {
      icon: "mdi:instagram",
      link: "https://www.instagram.com/sollungomaamiofficial/",
    },
    {
      icon: "mdi:youtube",
      link: "https://www.youtube.com/@sollungomaami924",
    },
    {
      icon: "mdi:spotify",
      link: "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8",
    },
  ],
  maxSidebarCategoryChip: 6, // It is recommended to set it to a common multiple of 2 and 3
  maxSidebarTagChip: 12,
  maxFooterCategoryChip: 6,
  maxFooterTagChip: 24,

  banners: [
    "https://raw.githubusercontent.com/AkshayNarayananB/SollungoMaami/master/images/newbg.png",
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default MaamiConfig;
