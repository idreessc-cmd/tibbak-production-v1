/**
 * Central Demo-Mode Context Parser
 * 
 * NOTE: This URL marker (demo=1) is only for the fictional MVP presentation 
 * and is NOT a production authorization or security mechanism.
 */

export function isDemoMode(
  searchParams?: { [key: string]: string | string[] | undefined } | URLSearchParams | string | null
): boolean {
  if (!searchParams) return false;

  if (typeof searchParams === 'string') {
    return searchParams === '1' || searchParams.includes('demo=1');
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.get('demo') === '1';
  }

  const val = searchParams.demo;
  if (Array.isArray(val)) {
    return val.includes('1');
  }

  return val === '1';
}

export function appendDemoParam(baseUrl: string, isDemo: boolean): string {
  if (!isDemo) return baseUrl;
  
  if (baseUrl.includes('demo=1')) return baseUrl;
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}demo=1`;
}
