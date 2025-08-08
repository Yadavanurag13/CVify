export function escapeLatex(input: string): string {
  // Escape LaTeX special characters
  return input
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([%$#&_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}');
}

export function escapeUrl(input: string): string {
  // Allow http(s) URLs; escape latex chars but keep :/.-?
  return escapeLatex(input).replace(/\\:/g, ':').replace(/\\\//g, '/').replace(/\\\./g, '.').replace(/\\\?/g, '?').replace(/\\-/g, '-');
}


