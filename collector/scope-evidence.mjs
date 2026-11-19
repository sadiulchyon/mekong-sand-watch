// Require an exact source passage before an automated collector can publish a scope claim.
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export function hasVerifiableScopeEvidence(source, quote) {
  const passage = clean(quote);
  return passage.length >= 12 && passage.length <= 400 &&
    clean(source).toLocaleLowerCase().includes(passage.toLocaleLowerCase());
}
