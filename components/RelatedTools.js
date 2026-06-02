import Link from 'next/link';
import { useRouter } from 'next/router';

const TOOL_GROUPS = {
  business: {
    label: 'Finance & Business',
    description: 'Useful calculators and business document tools.',
    tools: [
      { name: 'Tax Invoice Pro', href: '/invoicegenerator', desc: 'Create professional invoices with VAT, totals and PDF/print options.' },
      { name: 'EMI Calculator', href: '/emicalculator', desc: 'Calculate monthly loan payments and total interest.' },
      { name: 'SIP Calculator', href: '/sipcalculator', desc: 'Plan recurring investments and long-term wealth growth.' },
      { name: 'Percentage Calculator', href: '/percentagecalculator', desc: 'Calculate percentages, VAT, discounts, markup and margin.' },
      { name: 'Task List', href: '/tasklist', desc: 'Private task manager with priorities, due dates and export options.' }
    ]
  },

  pdf: {
    label: 'PDF & Document Tools',
    description: 'Convert, prepare and manage document files.',
    tools: [
      { name: 'PDF to Image', href: '/pdftoimage', desc: 'Extract PDF pages as PNG or JPG images.' },
      { name: 'Image to PDF', href: '/imagetopdf', desc: 'Convert photos and scans into a clean PDF document.' },

      // Future tools. We will enable these after creating the pages.
      // { name: 'PDF Merger', href: '/pdfmerge', desc: 'Combine multiple PDFs into one file.' },
      // { name: 'PDF Splitter', href: '/pdfsplit', desc: 'Extract selected pages from a PDF.' },
      // { name: 'PDF Compressor', href: '/pdfcompressor', desc: 'Reduce PDF file size for email and uploads.' },
      // { name: 'PDF Editor', href: '/pdfeditor', desc: 'Add text, signatures, images, annotations and page numbering.' },
      // { name: 'Signature Maker', href: '/signaturemaker', desc: 'Create a digital signature for forms and invoices.' },
      // { name: 'Passport Photo Maker', href: '/passportphoto', desc: 'Create passport-size photos with print sheets.' }
    ]
  },

  image: {
    label: 'Image & Design Tools',
    description: 'Optimize images, resize visuals and create design assets.',
    tools: [
      { name: 'Image Compressor', href: '/imagecompressor', desc: 'Reduce image file size while keeping visual quality.' },
      { name: 'Image Resizer', href: '/imageresizer', desc: 'Resize and crop images for social media, web and custom sizes.' },
      { name: 'Favicon Generator', href: '/favicongen', desc: 'Generate favicon and app icon packages for websites.' },
      { name: 'YouTube Thumbnail Downloader', href: '/thumbnaildownloader', desc: 'Extract HD thumbnails from YouTube videos and Shorts.' },
      { name: 'QR Code Generator', href: '/qrcode', desc: 'Create QR codes for URLs, WiFi, vCards and bulk lists.' }
    ]
  },

  text: {
    label: 'Text & Security Tools',
    description: 'Clean, analyze and secure text-based work.',
    tools: [
      { name: 'Case Converter', href: '/caseconverter', desc: 'Convert text to uppercase, title case, camelCase, snake_case and more.' },
      { name: 'Word Counter', href: '/wordcounter', desc: 'Count words, characters, reading time and keyword density.' },
      { name: 'Password Generator', href: '/passwordgen', desc: 'Generate secure passwords and passphrases locally.' },
      { name: 'Unit Converter', href: '/unitconverter', desc: 'Convert length, area, weight, temperature, data and more.' }
    ]
  },

  health: {
    label: 'Speed & Health Tools',
    description: 'Quick calculators and simple testing tools.',
    tools: [
      { name: 'CPS Test', href: '/cpstest', desc: 'Measure clicks per second and mouse speed.' },
      { name: 'Reaction Test', href: '/reactiontest', desc: 'Test visual reaction time in milliseconds.' },
      { name: 'BMI Calculator', href: '/bmicalculator', desc: 'Calculate body mass index and healthy weight insights.' },
      { name: 'Age Calculator', href: '/agecalculator', desc: 'Calculate exact age, date duration and birthday countdown.' }
    ]
  }
};

const PAGE_GROUP = Object.entries(TOOL_GROUPS).reduce((acc, [groupKey, group]) => {
  group.tools.forEach(tool => {
    acc[tool.href] = groupKey;
  });
  return acc;
}, {});

const HIDDEN_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer'
]);

const EXTRA_RELATED = {
  '/invoicegenerator': ['/percentagecalculator', '/signaturemaker', '/pdftoimage', '/imagetopdf', '/tasklist'],
  '/pdftoimage': ['/pdfeditor', '/imagetopdf', '/pdfmerge', '/pdfsplit', '/pdfcompressor', '/imagecompressor', '/imageresizer'],
  '/imagetopdf': ['/pdfeditor', '/pdftoimage', '/pdfmerge', '/pdfsplit', '/pdfcompressor', '/signaturemaker', '/passportphoto', '/imagecompressor', '/imageresizer'],
  '/pdfmerge': ['/pdfsplit', '/pdfcompressor', '/pdftoimage', '/imagetopdf', '/imagecompressor'],
  '/pdfsplit': ['/pdfmerge', '/pdfcompressor', '/pdftoimage', '/imagetopdf', '/imagecompressor'],
  '/pdfcompressor': ['/pdfeditor', '/pdfmerge', '/pdfsplit', '/signaturemaker', '/pdftoimage', '/imagetopdf', '/imagecompressor'],
  '/pdfeditor': ['/signaturemaker', '/pdfmerge', '/pdfsplit', '/pdfcompressor', '/pdftoimage', '/imagetopdf'],
  '/signaturemaker': ['/pdfeditor', '/pdfcompressor', '/pdfmerge', '/pdfsplit', '/imagetopdf', '/invoicegenerator'],
  '/passportphoto': ['/imageresizer', '/imagecompressor', '/signaturemaker', '/imagetopdf', '/pdfcompressor'],
  '/imagecompressor': ['/imageresizer', '/passportphoto', '/imagetopdf', '/pdftoimage'],
  '/imageresizer': ['/imagecompressor', '/passportphoto', '/imagetopdf', '/pdftoimage'],
  '/wordcounter': ['/caseconverter', '/qrcode', '/tasklist'],
  '/caseconverter': ['/wordcounter', '/qrcode', '/passwordgen'],
  '/percentagecalculator': ['/invoicegenerator', '/emicalculator', '/sipcalculator'],
  '/emicalculator': ['/sipcalculator', '/percentagecalculator', '/invoicegenerator'],
  '/sipcalculator': ['/emicalculator', '/percentagecalculator', '/unitconverter']
};

export default function RelatedTools() {
  const router = useRouter();
  const currentPath = normalizePath(router.pathname);

  if (HIDDEN_PATHS.has(currentPath)) return null;

  const currentGroupKey = PAGE_GROUP[currentPath];

  if (!currentGroupKey) return null;

  const currentGroup = TOOL_GROUPS[currentGroupKey];
  const sameGroupTools = currentGroup.tools.filter(tool => tool.href !== currentPath);

  const extraTools = (EXTRA_RELATED[currentPath] || [])
    .map(findToolByHref)
    .filter(Boolean)
    .filter(tool => tool.href !== currentPath);

  const combined = dedupeTools([...extraTools, ...sameGroupTools]).slice(0, 6);

  if (combined.length === 0) return null;

  return (
    <section style={wrap} aria-label="Related tools">
      <div style={inner}>
        <div style={header}>
          <p style={eyebrow}>Continue with SHB ToolBox</p>
          <h2 style={title}>Related Tools</h2>
          <p style={desc}>
            More useful tools from {currentGroup.label}. These links help you continue your workflow without searching again.
          </p>
        </div>

        <div style={grid}>
          {combined.map(tool => (
            <Link key={tool.href} href={tool.href} style={card}>
              <span style={cardName}>{tool.name}</span>
              <span style={cardDesc}>{tool.desc}</span>
              <span style={cardAction}>Open tool →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function findToolByHref(href) {
  for (const group of Object.values(TOOL_GROUPS)) {
    const found = group.tools.find(tool => tool.href === href);
    if (found) return found;
  }

  return null;
}

function dedupeTools(tools) {
  const seen = new Set();
  const result = [];

  tools.forEach(tool => {
    if (!tool || seen.has(tool.href)) return;
    seen.add(tool.href);
    result.push(tool);
  });

  return result;
}

const wrap = {
  background: '#0f172a',
  padding: '70px 20px',
  borderTop: '1px solid #1e293b'
};

const inner = {
  maxWidth: '1150px',
  margin: '0 auto'
};

const header = {
  textAlign: 'center',
  maxWidth: '760px',
  margin: '0 auto 32px'
};

const eyebrow = {
  color: '#38bdf8',
  fontSize: '0.75rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  margin: '0 0 10px'
};

const title = {
  color: '#fff',
  margin: '0 0 12px',
  fontSize: '2rem',
  fontWeight: 950
};

const desc = {
  color: '#94a3b8',
  lineHeight: 1.7,
  margin: 0
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px'
};

const card = {
  display: 'grid',
  gap: '10px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '22px',
  textDecoration: 'none',
  transition: '0.2s ease',
  minHeight: '150px'
};

const cardName = {
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 900
};

const cardDesc = {
  color: '#94a3b8',
  fontSize: '0.9rem',
  lineHeight: 1.6
};

const cardAction = {
  color: '#38bdf8',
  fontSize: '0.85rem',
  fontWeight: 900,
  marginTop: 'auto'
};
