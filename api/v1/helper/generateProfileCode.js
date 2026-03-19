function generateProfileCode() {
  return `PR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  // Output: PR-3F9A2B
}