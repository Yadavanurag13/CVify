import nunjucks from 'nunjucks';
import { execa } from 'execa';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ResumeData } from './types.js';
import { escapeLatex, escapeUrl } from './latex/sanitize.js';

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(join(process.cwd(), 'src/latex'), { noCache: true }),
  {
  autoescape: false,
  tags: {
    variableStart: '<<',
    variableEnd: '>>',
    blockStart: '<%',
    blockEnd: '%>',
    commentStart: '<#',
    commentEnd: '#>',
  },
  }
);

env.addFilter('escape_latex', (str: unknown) => (typeof str === 'string' ? escapeLatex(str) : str));
env.addFilter('escape_url', (str: unknown) => (typeof str === 'string' ? escapeUrl(str) : str));
env.addFilter('join', (arr: unknown, sep: string) => (Array.isArray(arr) ? arr.join(sep) : arr));

export async function renderSb2nov(data: ResumeData): Promise<Buffer> {
  const tex = env.render('template_sb2nov_full.tex.njk', data as any);

  const workDir = mkdtempSync(join(tmpdir(), 'rb-'));
  const texPath = join(workDir, 'resume.tex');
  const pdfPath = join(workDir, 'resume.pdf');
  writeFileSync(texPath, tex, 'utf8');

  // Compile using tectonic
  await execa('tectonic', ['-X', 'compile', texPath, '--outdir', workDir, '--print'], {
    timeout: 90000,
  });

  const pdf = readFileSync(pdfPath);
  rmSync(workDir, { recursive: true, force: true });
  return pdf;
}


