export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['admin', 'web', 'supabase', 'types', 'utils', 'ui', 'eslint-config', 'docs', 'deps', 'ci'],
    ],
  },
}
