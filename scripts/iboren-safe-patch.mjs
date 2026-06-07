import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const HOME_HEADER = "app/components/home/HomeHeader.tsx";
const HOME_HERO = "app/components/home/HomeHero.tsx";
const HOME_BOOKING_CTA = "app/components/home/HomeBookingCta.tsx";

function replaceOnce(content, before, after, description) {
  const first = content.indexOf(before);
  if (first === -1) throw new Error(`Expected content not found: ${description}`);
  if (content.indexOf(before, first + before.length) !== -1) throw new Error(`Expected one match, found multiple: ${description}`);
  return content.slice(0, first) + after + content.slice(first + before.length);
}

function replaceExactCount(content, before, after, expectedCount, description) {
  const matches = content.split(before).length - 1;
  if (matches !== expectedCount) throw new Error(`Expected ${expectedCount} matches, found ${matches}: ${description}`);
  return content.split(before).join(after);
}

function editFile(path, edits) {
  let content = readFileSync(path, "utf8");
  for (const edit of edits) {
    content = edit.expectedCount
      ? replaceExactCount(content, edit.before, edit.after, edit.expectedCount, edit.description)
      : replaceOnce(content, edit.before, edit.after, edit.description);
  }
  writeFileSync(path, content, "utf8");
}

const tasks = {
  home_cta_cleanup: {
    allowedFiles: [HOME_HEADER, HOME_HERO, HOME_BOOKING_CTA],
    apply() {
      editFile(HOME_HEADER, [
        {
          description: "desktop header CTA",
          before: '<Link href="/boka-utan-konto" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Skicka förfrågan</Link>',
          after: '<Link href="/priser#pris-kalkylator" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Få pris direkt</Link>'
        },
        {
          description: "mobile header CTA",
          before: '<Link href="/boka-utan-konto" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Skicka förfrågan</Link>',
          after: '<Link href="/priser#pris-kalkylator" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Få pris direkt</Link>'
        }
      ]);

      editFile(HOME_HERO, [
        {
          description: "hero CTAs",
          before: '<div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"><Link href="/priser" className="btn-primary">Beräkna pris <ArrowUpRight size={17} /></Link><Link href="/boka-utan-konto" className="btn-secondary">Skicka förfrågan</Link></div>',
          after: '<div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"><Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt <ArrowUpRight size={17} /></Link></div>'
        },
        {
          description: "hero helper text",
          before: '<p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75">Vi bekräftar alltid tid och slutligt pris innan förfrågan blir bindande.</p>',
          after: '<p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75">Beräkna pris först. Du kan gå vidare till en ej bindande bokningsförfrågan när allt ser rätt ut.</p>'
        }
      ]);

      editFile(HOME_BOOKING_CTA, [
        {
          description: "booking CTA heading",
          before: '<h3 className="text-2xl font-bold text-porcelain">Skicka en bokningsförfrågan</h3>',
          after: '<h3 className="text-2xl font-bold text-porcelain">Beräkna pris direkt</h3>'
        },
        {
          description: "booking CTA body",
          before: '<p className="mt-3 text-porcelain/80">Fyll i formuläret på vår bokningssida. Du får en tydlig sammanfattning och prisindikation innan du skickar.</p>',
          after: '<p className="mt-3 text-porcelain/80">Få en tydlig prisindikation först. När allt ser rätt ut kan du fortsätta till en ej bindande bokningsförfrågan.</p>'
        },
        {
          description: "booking CTA links",
          before: '<div className="mt-6 flex flex-wrap items-center gap-3">\n              <Link href="/boka-utan-konto" className="btn-primary">Öppna bokningsformulär</Link>\n              <Link href="/priser" className="btn-secondary">Se priser först</Link>\n            </div>',
          after: '<div className="mt-6 flex flex-wrap items-center gap-3">\n              <Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt</Link>\n            </div>'
        }
      ]);
    }
  },
  home_nav_hover_polish: {
    allowedFiles: [HOME_HEADER],
    apply() {
      editFile(HOME_HEADER, [
        {
          description: "desktop nav spacing",
          before: '<div className="hidden items-center gap-6 text-sm font-semibold text-porcelain/68 md:flex">',
          after: '<div className="hidden items-center gap-2 text-sm font-semibold text-porcelain/68 md:flex">'
        },
        {
          description: "desktop nav link hover classes",
          before: 'className="hover:text-gold"',
          after: 'className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold"',
          expectedCount: 6
        },
        {
          description: "desktop login/profile hover class",
          before: 'className="inline-flex items-center gap-2 hover:text-gold"',
          after: 'className="inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold"'
        }
      ]);
    }
  }
};

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function changedFiles() {
  const tracked = git("diff", "--name-only", "--diff-filter=ACMRTUXB").split(/\r?\n/).filter(Boolean);
  const staged = git("diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB").split(/\r?\n/).filter(Boolean);
  const untracked = git("ls-files", "--others", "--exclude-standard").split(/\r?\n/).filter(Boolean);
  return [...new Set([...tracked, ...staged, ...untracked])].sort();
}

function verifyAllowedFiles(task) {
  const allowed = new Set(task.allowedFiles);
  const disallowed = changedFiles().filter((path) => !allowed.has(path));
  if (disallowed.length) throw new Error(`Task changed files outside its allowlist: ${disallowed.join(", ")}`);
}

const args = process.argv.slice(2);
const verifyOnly = args.includes("--verify-only");
const taskId = args.find((arg) => arg !== "--verify-only");

if (!taskId || !Object.hasOwn(tasks, taskId)) {
  throw new Error(`Unsupported task_id. Supported values: ${Object.keys(tasks).join(", ")}`);
}

const branch = git("branch", "--show-current");
if (!branch || branch === "main" || branch === "master") throw new Error("Safe patches must run on a non-default branch.");

const task = tasks[taskId];
if (!verifyOnly) {
  if (changedFiles().length) throw new Error("Safe patch runner requires a clean working tree.");
  task.apply();
}

verifyAllowedFiles(task);
console.log(`${verifyOnly ? "Verified" : "Applied"} safe patch task: ${taskId}`);
console.log(`Allowed files: ${task.allowedFiles.join(", ")}`);
