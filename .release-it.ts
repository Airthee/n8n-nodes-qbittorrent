import type { Config } from 'release-it';

export default {
  git: {
    commit: true,
    tag: true,
    push: true
  },
  github: {
    release: true,
		host: 'github.com'
  },
  npm: {
    publish: true
  }
} satisfies Config;
