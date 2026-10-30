import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const assetsDir = path.join(siteDir, 'assets');
const tempHtmlDir = path.join(siteDir, 'generator', 'temp_html');
const tempUserDataDir = '/tmp/chrome-website-boards';

fs.mkdirSync(tempHtmlDir, { recursive: true });
fs.mkdirSync(tempUserDataDir, { recursive: true });

function renderTemplate({
  featureTag,
  titleMain,
  titleGradient,
  subtitle,
  bullets,
  topPill,
  bottomPill,
  panelTitle,
  imageRelativePath
}) {
  const bulletItemsHtml = bullets.map(b => `
    <div class="feature-item">
      <div class="feature-icon">${b.icon}</div>
      <div class="feature-text">
        <h4>${b.title}</h4>
        <p>${b.desc}</p>
      </div>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1280px;
      height: 800px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #f8fafd 0%, #eef4fc 45%, #f1f6ff 100%);
      color: #091e42;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 35px 55px;
      position: relative;
    }

    /* Ambient background glows */
    .glow-1 {
      position: absolute;
      width: 550px;
      height: 550px;
      top: -120px;
      left: -100px;
      background: radial-gradient(circle, rgba(0, 82, 204, 0.08) 0%, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
    }
    .glow-2 {
      position: absolute;
      width: 650px;
      height: 650px;
      bottom: -160px;
      right: 120px;
      background: radial-gradient(circle, rgba(0, 163, 196, 0.09) 0%, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
    }

    /* Left Column */
    .left-col {
      width: 660px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(0, 82, 204, 0.08);
      border: 1px solid rgba(0, 82, 204, 0.2);
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 700;
      color: #0052cc;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      width: fit-content;
    }

    .title {
      font-size: 40px;
      font-weight: 800;
      line-height: 1.15;
      color: #091e42;
      letter-spacing: -0.5px;
    }

    .title span {
      background: linear-gradient(135deg, #0052cc 0%, #00a3c4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 16.5px;
      line-height: 1.5;
      color: #42526e;
      font-weight: 400;
      margin-top: -6px;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 13px;
      margin-top: 2px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(223, 225, 230, 0.85);
      border-radius: 12px;
      padding: 11px 16px;
      box-shadow: 0 4px 14px rgba(9, 30, 66, 0.04);
    }

    .feature-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #deebff;
      color: #0052cc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 17px;
    }

    .feature-text h4 {
      font-size: 15px;
      font-weight: 700;
      color: #091e42;
      margin-bottom: 2px;
    }

    .feature-text p {
      font-size: 13px;
      color: #5e6c84;
      line-height: 1.4;
    }

    /* Right Column - Mockup Frame */
    .right-col {
      z-index: 2;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 470px;
    }

    .panel-frame {
      width: 425px;
      height: 725px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 24px 60px -10px rgba(9, 30, 66, 0.22), 0 0 1px 1px rgba(9, 30, 66, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(223, 225, 230, 0.95);
      position: relative;
    }

    .panel-header {
      height: 36px;
      background: #f4f5f7;
      border-bottom: 1px solid #dfe1e6;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 8px;
      flex-shrink: 0;
    }

    .dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }

    .panel-title {
      font-size: 11px;
      font-weight: 600;
      color: #6b778c;
      margin-left: 6px;
      letter-spacing: 0.2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .panel-img {
      width: 100%;
      height: calc(100% - 36px);
      object-fit: contain;
      object-position: top center;
      display: block;
      background-color: #f8fafc;
    }

    /* Floating badges */
    .floating-pill {
      position: absolute;
      background: #ffffff;
      border: 1px solid #0052cc;
      color: #0052cc;
      padding: 7px 15px;
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 700;
      box-shadow: 0 10px 24px rgba(0, 82, 204, 0.18);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
      white-space: nowrap;
    }

    .pill-bottom-left {
      bottom: 25px;
      left: -20px;
      background: #ffffff;
      color: #091e42;
      border-color: #dfe1e6;
      box-shadow: 0 12px 28px rgba(9, 30, 66, 0.15);
    }

    .pill-top-right {
      top: 45px;
      right: -15px;
      background: #0052cc;
      color: #ffffff;
      border-color: #0052cc;
      box-shadow: 0 12px 28px rgba(0, 82, 204, 0.35);
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Left Column -->
  <div class="left-col">
    <div class="badge-pill">
      <span>${featureTag}</span>
    </div>

    <h1 class="title">${titleMain} <span>${titleGradient}</span></h1>
    
    <p class="subtitle">${subtitle}</p>

    <div class="features-list">
      ${bulletItemsHtml}
    </div>
  </div>

  <!-- Right Column -->
  <div class="right-col">
    <div class="floating-pill pill-top-right">
      ${topPill}
    </div>

    <div class="panel-frame">
      <div class="panel-header">
        <div class="dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="panel-title">${panelTitle}</div>
      </div>
      <img class="panel-img" src="${imageRelativePath}" alt="${panelTitle}">
    </div>

    <div class="floating-pill pill-bottom-left">
      ${bottomPill}
    </div>
  </div>
</body>
</html>`;
}

const boards = [
  {
    name: 'screenshot-1-visual-bug-capture-1280x800',
    data: {
      featureTag: '● FEATURE 01 • VISUAL BUG CREATOR',
      titleMain: 'Capture, Analyze & Report Bugs in',
      titleGradient: 'Seconds',
      subtitle: 'Eliminate manual QA documentation. Capture full tabs or snips, auto-diagnose UI anomalies with AI, and sync to Jira instantly.',
      bullets: [
        {
          icon: '✨',
          title: 'Dual Vision AI Switcher (OpenAI & Gemini)',
          desc: 'Toggle between OpenAI (GPT-4o / GPT-4o-mini) and Google Gemini (3.8 Flash) directly in the bug creator.'
        },
        {
          icon: '💻',
          title: 'Automated Environment Diagnostics',
          desc: 'Automatic detection of OS, browser version, viewport, and screen resolution formatted into clean Jira tables.'
        },
        {
          icon: '⌨️',
          title: 'Global Keyboard Shortcuts',
          desc: 'Trigger instant capture anywhere in Chrome with ⌘+Shift+S (macOS) or Alt+Shift+S (Win/Linux).'
        }
      ],
      topPill: '⚡ Instant AI Switcher',
      bottomPill: '🎯 Auto-Detected Specs: macOS & Viewport',
      panelTitle: 'BugAgent AI — New Issue Creator',
      imageRelativePath: '../../assets/user_raw/user-1-new-issue.png'
    }
  },
  {
    name: 'screenshot-2-onboarding-wizard-1280x800',
    data: {
      featureTag: '● FEATURE 02 • INSTANT ONBOARDING',
      titleMain: 'Zero Friction Setup: Ready in',
      titleGradient: '60 Seconds',
      subtitle: 'No complex server configuration. Connect your Jira workspace and optional AI engine in two straightforward steps.',
      bullets: [
        {
          icon: '🔗',
          title: 'Universal Jira Connection',
          desc: 'Seamlessly works with Jira Cloud and Jira Server / Data Center using Personal Access Tokens (PAT).'
        },
        {
          icon: '🤖',
          title: 'Choose Your Preferred AI Agent',
          desc: 'Select Google Gemini or OpenAI right from day one, or start without AI and enable it anytime in Settings.'
        },
        {
          icon: '🔒',
          title: '100% Client-Side Privacy (BYOK)',
          desc: 'Your API keys and Jira credentials stay strictly inside your local browser storage. Zero telemetry.'
        }
      ],
      topPill: '🚀 2-Step Fast Setup',
      bottomPill: '🔐 100% Local Credentials (BYOK)',
      panelTitle: 'BugAgent AI — Getting Started Wizard',
      imageRelativePath: '../../assets/user_raw/user-2-onboarding.png'
    }
  },
  {
    name: 'screenshot-3-dual-ai-settings-1280x800',
    data: {
      featureTag: '● FEATURE 03 • MULTI-AI & CONTROL',
      titleMain: 'Granular Control Over Your',
      titleGradient: 'AI & Jira Stack',
      subtitle: 'Customize prompt behaviors, default issue types, and theme settings to match your team\'s QA workflow.',
      bullets: [
        {
          icon: '⚙️',
          title: 'Multi-AI Engine Configuration',
          desc: 'Configure OpenAI (GPT-4o, GPT-4o-mini) and Google Gemini models with full BYOK key management.'
        },
        {
          icon: '🌓',
          title: 'Appearance & Theme Selection',
          desc: 'Toggle between sleek Light Mode and battery-friendly Dark Mode, or sync automatically with your system.'
        },
        {
          icon: '📊',
          title: 'Live Usage & Quota Monitoring',
          desc: 'Track monthly submitted bugs and verify live status indicators for Jira and AI connectivity at a glance.'
        }
      ],
      topPill: '🧠 GPT-4o & Gemini BYOK',
      bottomPill: '📊 Live Bug Quota Tracking',
      panelTitle: 'BugAgent AI — Settings & AI Analyzer',
      imageRelativePath: '../../assets/user_raw/user-3-settings.png'
    }
  },
  {
    name: 'screenshot-4-recent-issues-1280x800',
    data: {
      featureTag: '● FEATURE 04 • RECENT SUBMISSIONS',
      titleMain: 'Browse, Copy & Share Tickets',
      titleGradient: 'Without Leaving Chrome',
      subtitle: 'Never lose track of your filed issues. Review recently created bugs and share direct links with engineering teams in one click.',
      bullets: [
        {
          icon: '💬',
          title: 'One-Click Slack & Teams Sharing',
          desc: 'Copy formatted markdown summaries ready to paste directly into Slack, Teams, or development channels.'
        },
        {
          icon: '🔗',
          title: 'Direct Jira Ticket Deep-Links',
          desc: 'Jump directly to your Jira issues (DEV-101 to DEV-105) in a new tab with a single click.'
        },
        {
          icon: '📋',
          title: 'Recent Issue History Cache',
          desc: 'Fast overview of submitted issues with quick clipboard copy and clear-all capabilities.'
        }
      ],
      topPill: '⚡ Instant Slack / Teams Share',
      bottomPill: '🔗 Deep-Links to DEV-101..105',
      panelTitle: 'BugAgent AI — Recent Submissions',
      imageRelativePath: '../../assets/user_raw/user-4-recent.png'
    }
  },
  {
    name: 'screenshot-5-global-shortcuts-1280x800',
    data: {
      featureTag: '● FEATURE 05 • KNOWLEDGE BASE & QA GUIDE',
      titleMain: 'Built-in Guides, API Setup &',
      titleGradient: 'QA Best Practices',
      subtitle: 'Everything you need to master visual testing, keyboard shortcuts, and API tokens right inside the extension.',
      bullets: [
        {
          icon: '🔑',
          title: 'Interactive Token Guides',
          desc: 'Collapsible setup instructions for Jira PAT / Cloud tokens, Google Gemini keys, and OpenAI keys.'
        },
        {
          icon: '⌨️',
          title: 'Keyboard Shortcut Reference',
          desc: 'Complete cheatsheet for active tab capture, quick screenshot paste, and sidebar navigation.'
        },
        {
          icon: '⭐',
          title: 'Community & Feedback',
          desc: 'Quick access to welcome wizard re-runs, feature requests, and 5-star Chrome Web Store reviews.'
        }
      ],
      topPill: '📖 Interactive API Setup Guides',
      bottomPill: '⌨️ Keyboard Cheatsheet',
      panelTitle: 'BugAgent AI — Help & QA Best Practices',
      imageRelativePath: '../../assets/user_raw/user-5-help.png'
    }
  }
];

const chromeBinary = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

console.log('🎨 Generating 5 Presentation Boards (1280x800) for BugAgent AI website...');

for (const b of boards) {
  const htmlContent = renderTemplate(b.data);
  const htmlPath = path.join(tempHtmlDir, `${b.name}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const rawPng = path.join(assetsDir, `${b.name}.png`);
  const finalJpg = path.join(assetsDir, `${b.name}.jpg`);

  console.log(`📸 Rendering: ${b.name}...`);
  const cmd = `"${chromeBinary}" --headless=new --no-sandbox --disable-gpu --user-data-dir="${tempUserDataDir}" --screenshot="${rawPng}" --window-size=1280,800 "file://${htmlPath}"`;
  execSync(cmd, { stdio: 'ignore' });

  // Convert to clean JPEG quality 98
  const sipsCmd = `sips -s format jpeg -s formatOptions 98 "${rawPng}" --out "${finalJpg}"`;
  execSync(sipsCmd, { stdio: 'ignore' });

  // Remove intermediate PNG
  fs.unlinkSync(rawPng);

  const size = fs.statSync(finalJpg).size;
  console.log(`   ✔ Success: ${b.name}.jpg (${(size / 1024).toFixed(1)} KB)`);
}

console.log('\n🎉 All 5 boards successfully created in assets/ directory!');
