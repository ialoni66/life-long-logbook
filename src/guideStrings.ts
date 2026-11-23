// The words on the install page, in each language. Pure data, so it can be checked on its own.
// "labels" are what the little phone drawings say; they copy the wording a phone in that language shows.
import type { Lang } from "./lang";

export type GuideStep = { title: string; body: string; note: string };

export type Guide = {
  tagline: string;
  toggleLabel: string;
  inAppFirst: (browser: string) => string;
  inAppRest: (menu: string, browser: string) => { before: string; bold: string; after: string };
  which: string; whichSub: string;
  iosName: string; iosSub: string; androidName: string; androidSub: string; likely: string;
  wrongPhone: string;
  otherIPhoneBrowser: string;
  samsungTitle: string; samsungBody: string;
  otherAndroidBrowser: string;
  installedBold: string; installedRest: string;
  oneTapTitle: string; oneTapBody: string; oneTapButton: string;
  declined: string;
  stepOf: (i: number, n: number) => string;
  back: string; next: string; done: string;
  about: string; aboutName: (n: string) => string;
  free: string;
  useBrowser: string; warnText: string; goBack: string; continueBrowser: string;
  ios: GuideStep[]; android: GuideStep[];
  aria: { share: string; more: string; sheet: string; add: string; home: string; chromeBar: string; chromeMenu: string; dialog: string };
  fig: {
    tapHere: string; onSome: string; tapDots: string;
    copy: string; bookmarks: string; addHome: string; findPage: string;
    cancel: string; addTitle: string; add: string; openWebApp: string;
    chromeRows: string[]; chromeHot: number; threeDots: string;
    installQ: string; install: string;
  };
};

const en: Guide = {
  tagline: "A private logbook for the people you meet.",
  toggleLabel: "Language",
  inAppFirst: (b) => `Open this page in ${b} first.`,
  inAppRest: (menu, b) => ({
    before: " You are inside another app's browser, which can't install apps. Tap the " + menu + " menu or the browser icon and choose ",
    bold: `Open in ${b}`, after: ".",
  }),
  which: "Which phone do you have?",
  whichSub: "Pick yours and we'll show you how to get Rolodex on it.",
  iosName: "iPhone or iPad", iosSub: "Install with Safari", androidName: "Android", androidSub: "Install with Chrome",
  likely: "Likely yours",
  wrongPhone: "Wrong phone? Choose a different one",
  otherIPhoneBrowser: "The steps below are for Safari. Your browser may work too, but if anything looks different, open this link in Safari.",
  samsungTitle: "Using Samsung Internet?",
  samsungBody: "Tap the ≡ menu, then Add page to, then Home screen. For the full app experience, Chrome works best.",
  otherAndroidBrowser: "The steps below are for Chrome. Your browser may offer the same thing in its menu; if anything looks different, open this link in Chrome.",
  installedBold: "Rolodex is installed.", installedRest: " Open it from your Home screen or app list. You can close this page.",
  oneTapTitle: "Install it in one tap",
  oneTapBody: "Your phone can do the steps for you. Or follow the steps below if you prefer.",
  oneTapButton: "Install Rolodex",
  declined: "No problem. You can install it any time by following the steps below.",
  stepOf: (i, n) => `Step ${i} of ${n}`,
  back: "Back", next: "Next step", done: "That's it. Enjoy Rolodex.",
  about: "About", aboutName: (n) => `About ${n}`,
  free: "Free. No account. Your entries are stored only on your own phone.",
  useBrowser: "Use it in this browser instead",
  warnText: "Entries made in the browser stay in the browser. They will not move to the app on your phone later, except by using Save file and Import data in Settings.",
  goBack: "Go back", continueBrowser: "Continue in the browser",
  ios: [
    { title: "Tap the Share button", body: "It is the square with an arrow pointing up, in Safari's toolbar.", note: "Safari looks a little different on every iPhone. Either way, Share is the one you are looking for." },
    { title: "Choose “Add to Home Screen”", body: "Scroll down the list until you see it, then tap it.", note: "Not in the list? Scroll to the very bottom, tap Edit Actions, then tap the + next to Add to Home Screen." },
    { title: "Tap Add", body: "The name is already Rolodex. If you see an “Open as Web App” switch, leave it on (green). Then tap Add in the top corner.", note: "On newer iPhones, if that switch is off the icon opens Safari instead of the app. If that happens, delete the icon and add it again with the switch on. Older iPhones don't show the switch, so just tap Add." },
    { title: "Open Rolodex from your Home Screen", body: "Find the new icon and tap it. It opens full screen, like any other app.", note: "Always open it from that icon. Anything you type into this browser page stays in the browser and will not appear in the app." },
  ],
  android: [
    { title: "Tap the three dots", body: "They are at the top right of Chrome, next to the address bar.", note: "If your address bar is at the bottom of the screen, the three dots are at the bottom right." },
    { title: "Choose “Install app”", body: "Look for Install app in the menu and tap it.", note: "Depending on your Chrome version it may say “Install and create shortcut” or “Add to Home screen” instead. If you are offered both Install and Create shortcut, choose Install, because that makes a real app." },
    { title: "Tap Install", body: "Chrome asks you to confirm. Tap Install.", note: "Some phones then show a second box asking to add the icon to your Home screen. Tap Add, or touch and hold the icon and drag it where you want it." },
    { title: "Open Rolodex from your phone", body: "Find the new Rolodex icon on your Home screen or in your app list and tap it. It opens full screen, like any other app.", note: "Always open it from that icon. Anything you type into this browser page stays in the browser and will not appear in the app." },
  ],
  aria: {
    share: "The Safari toolbar with the Share button highlighted",
    more: "The Safari address bar with the more button highlighted",
    sheet: "The Share menu with Add to Home Screen highlighted",
    add: "The Add to Home Screen window with the switch and the Add button highlighted",
    home: "The Home Screen with the new Rolodex icon highlighted",
    chromeBar: "Chrome's address bar with the three-dot menu button highlighted",
    chromeMenu: "Chrome's menu with Install app highlighted",
    dialog: "Chrome's Install app window with the Install button highlighted",
  },
  fig: {
    tapHere: "Tap here", onSome: "On some iPhones you will see this instead:", tapDots: "Tap the dots, then tap Share",
    copy: "Copy", bookmarks: "Add to Bookmarks", addHome: "Add to Home Screen", findPage: "Find on Page",
    cancel: "Cancel", addTitle: "Add to Home Screen", add: "Add", openWebApp: "Open as Web App",
    chromeRows: ["New tab", "New Incognito tab", "History", "Install app", "Share…", "Settings"], chromeHot: 3,
    threeDots: "Tap the three dots", installQ: "Install app?", install: "Install",
  },
};

const he: Guide = {
  tagline: "יומן פרטי לאנשים שאתם פוגשים.",
  toggleLabel: "שפה",
  inAppFirst: (b) => `פתחו את הדף הזה ב־${b} קודם.`,
  inAppRest: (menu, b) => ({
    before: " אתם בתוך דפדפן של אפליקציה אחרת, ודפדפן כזה לא יכול להתקין אפליקציות. הקישו על תפריט " + menu + " או על סמל הדפדפן ובחרו ״",
    bold: `פתיחה ב־${b}`, after: "״.",
  }),
  which: "איזה טלפון יש לכם?",
  whichSub: "בחרו את הטלפון שלכם ונראה לכם איך מתקינים עליו את Rolodex.",
  iosName: "iPhone או iPad", iosSub: "התקנה דרך Safari", androidName: "Android", androidSub: "התקנה דרך Chrome",
  likely: "כנראה שלכם",
  wrongPhone: "טלפון לא נכון? בחרו אחר",
  otherIPhoneBrowser: "השלבים למטה מתאימים ל־Safari. ייתכן שהדפדפן שלכם יעבוד גם, אבל אם משהו נראה שונה, פתחו את הקישור הזה ב־Safari.",
  samsungTitle: "משתמשים ב־Samsung Internet?",
  samsungBody: "הקישו על תפריט ≡, אחר כך על ״הוספת דף ל…״ ואז על ״מסך הבית״. לחוויית האפליקציה המלאה, Chrome הכי מתאים.",
  otherAndroidBrowser: "השלבים למטה מתאימים ל־Chrome. ייתכן שהדפדפן שלכם מציע את אותו הדבר בתפריט שלו; אם משהו נראה שונה, פתחו את הקישור הזה ב־Chrome.",
  installedBold: "Rolodex הותקנה.", installedRest: " פתחו אותה ממסך הבית או מרשימת האפליקציות. אפשר לסגור את הדף הזה.",
  oneTapTitle: "התקנה בהקשה אחת",
  oneTapBody: "הטלפון שלכם יכול לבצע את השלבים במקומכם. או שאפשר לפעול לפי השלבים שלמטה.",
  oneTapButton: "התקנת Rolodex",
  declined: "אין בעיה. אפשר להתקין בכל זמן לפי השלבים שלמטה.",
  stepOf: (i, n) => `שלב ${i} מתוך ${n}`,
  back: "חזרה", next: "לשלב הבא", done: "זה הכול. תהנו מ־Rolodex.",
  about: "אודות", aboutName: (n) => `אודות ${n}`,
  free: "חינם. בלי חשבון. הרשומות שלכם נשמרות רק בטלפון שלכם.",
  useBrowser: "להשתמש בדפדפן הזה במקום",
  warnText: "רשומות שנוצרו בדפדפן נשארות בדפדפן. הן לא יעברו לאפליקציה בטלפון בהמשך, אלא באמצעות ״שמירת קובץ״ ו״ייבוא נתונים״ בהגדרות.",
  goBack: "חזרה", continueBrowser: "להמשיך בדפדפן",
  ios: [
    { title: "הקישו על כפתור השיתוף", body: "זה הריבוע עם החץ שמצביע כלפי מעלה, בסרגל הכלים של Safari.", note: "Safari נראה מעט שונה בכל iPhone. בכל מקרה, כפתור השיתוף הוא מה שאתם מחפשים." },
    { title: "בחרו ״הוספה למסך הבית״", body: "גללו למטה ברשימה עד שתראו את האפשרות, והקישו עליה.", note: "לא ברשימה? גללו עד הסוף, הקישו על ״עריכת פעולות״ ואז על ה־+ ליד ״הוספה למסך הבית״." },
    { title: "הקישו על ״הוספה״", body: "השם כבר Rolodex. אם מופיע מתג ״פתיחה כאפליקציית אינטרנט״, השאירו אותו דלוק (ירוק). אחר כך הקישו על ״הוספה״ בפינה העליונה.", note: "ב־iPhone חדשים, אם המתג כבוי הסמל ייפתח ב־Safari ולא כאפליקציה. אם זה קורה, מחקו את הסמל והוסיפו אותו שוב כשהמתג דלוק. ב־iPhone ישנים אין מתג, אז פשוט הקישו על ״הוספה״." },
    { title: "פתחו את Rolodex ממסך הבית", body: "מצאו את הסמל החדש והקישו עליו. הוא נפתח במסך מלא, כמו כל אפליקציה.", note: "תמיד פתחו אותה מהסמל הזה. כל מה שתכתבו בדף הדפדפן הזה נשאר בדפדפן ולא יופיע באפליקציה." },
  ],
  android: [
    { title: "הקישו על שלוש הנקודות", body: "הן בפינה העליונה של Chrome, ליד שורת הכתובת.", note: "אם שורת הכתובת נמצאת בתחתית המסך, שלוש הנקודות נמצאות גם הן בתחתית." },
    { title: "בחרו ״התקנת האפליקציה״", body: "חפשו בתפריט את ״התקנת האפליקציה״ והקישו עליה.", note: "בהתאם לגרסת Chrome, ייתכן שכתוב במקום זה ״התקנה ויצירת קיצור דרך״ או ״הוספה למסך הבית״. אם מוצעות גם ״התקנה״ וגם ״יצירת קיצור דרך״, בחרו ״התקנה״, כי היא יוצרת אפליקציה אמיתית." },
    { title: "הקישו על ״התקנה״", body: "Chrome מבקש אישור. הקישו על ״התקנה״.", note: "בחלק מהטלפונים יופיע אחר כך חלון נוסף שמבקש להוסיף את הסמל למסך הבית. הקישו על ״הוספה״, או החזיקו את הסמל וגררו אותו למקום שתרצו." },
    { title: "פתחו את Rolodex מהטלפון", body: "מצאו את סמל Rolodex החדש במסך הבית או ברשימת האפליקציות והקישו עליו. הוא נפתח במסך מלא, כמו כל אפליקציה.", note: "תמיד פתחו אותה מהסמל הזה. כל מה שתכתבו בדף הדפדפן הזה נשאר בדפדפן ולא יופיע באפליקציה." },
  ],
  aria: {
    share: "סרגל הכלים של Safari עם כפתור השיתוף מודגש",
    more: "שורת הכתובת של Safari עם כפתור ״עוד״ מודגש",
    sheet: "תפריט השיתוף עם ״הוספה למסך הבית״ מודגש",
    add: "חלון ההוספה למסך הבית עם המתג וכפתור ״הוספה״ מודגשים",
    home: "מסך הבית עם הסמל החדש של Rolodex מודגש",
    chromeBar: "שורת הכתובת של Chrome עם כפתור שלוש הנקודות מודגש",
    chromeMenu: "התפריט של Chrome עם ״התקנת האפליקציה״ מודגש",
    dialog: "חלון ההתקנה של Chrome עם כפתור ״התקנה״ מודגש",
  },
  fig: {
    tapHere: "הקישו כאן", onSome: "ב־iPhone מסוימים תראו במקום זה:", tapDots: "הקישו על הנקודות, ואז על ״שיתוף״",
    copy: "העתקה", bookmarks: "הוספה לסימניות", addHome: "הוספה למסך הבית", findPage: "חיפוש בדף",
    cancel: "ביטול", addTitle: "הוספה למסך הבית", add: "הוספה", openWebApp: "פתיחה כאפליקציית אינטרנט",
    chromeRows: ["כרטיסייה חדשה", "כרטיסיית גלישה בסתר חדשה", "היסטוריה", "התקנת האפליקציה", "שיתוף…", "הגדרות"], chromeHot: 3,
    threeDots: "הקישו על שלוש הנקודות", installQ: "להתקין את האפליקציה?", install: "התקנה",
  },
};

export const GUIDE: Record<Lang, Guide> = { en, he };
