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
  avatarUrl: "https://raw.githubusercontent.com/AkshayNarayananB/SollungoMaami/master/images/20140808_084243.jpg",
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
    "https://res.cloudinary.com/dupwt6i5f/image/upload/v1752769370/IMG_20200630_120327_w61pbk.jpg",
    "https://res.cloudinary.com/dupwt6i5f/image/upload/v1752769370/IMG_20210804_130409_ztjkvx.jpg",
    "https://static.wixstatic.com/media/ccfeb1_fe5fa08b42ac4c89ade0b3f8c52bbf0d~mv2.jpg/v1/fill/w_2850,h_556,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ccfeb1_fe5fa08b42ac4c89ade0b3f8c52bbf0d~mv2.jpg",
    "https://res.cloudinary.com/dupwt6i5f/image/upload/v1752852606/IMG_20210830_191548_i0qgrb.jpg",
    "https://res.cloudinary.com/dupwt6i5f/image/upload/v1752852606/20141230_155648_cnmoyj.jpg",
    "https://res.cloudinary.com/dupwt6i5f/image/upload/v1752852606/IMG_20201102_195455_hvjuoa.jpg",
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
