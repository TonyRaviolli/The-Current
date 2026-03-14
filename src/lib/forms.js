const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(payload) {
  const errors = [];
  if (!payload.name || payload.name.trim().length < 2) errors.push('name');
  if (!payload.email || !EMAIL_RE.test(payload.email)) errors.push('email');
  if (!payload.message || payload.message.trim().length < 10) errors.push('message');
  return errors;
}

export function validateSource(payload) {
  const errors = [];
  if (!payload.name || payload.name.trim().length < 2) errors.push('name');
  if (!payload.url || !payload.url.startsWith('http')) errors.push('url');
  if (!payload.rationale || payload.rationale.trim().length < 10) errors.push('rationale');
  return errors;
}

export function validateTopic(payload) {
  const errors = [];
  if (!payload.topic || payload.topic.trim().length < 3) errors.push('topic');
  if (!payload.context || payload.context.trim().length < 10) errors.push('context');
  return errors;
}
