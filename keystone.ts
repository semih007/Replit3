import { config, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, password, timestamp, select } from '@keystone-6/core/fields';

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/keystone',
  },
  lists: {
    User: list({
      access: allowAll,
      fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
        password: password({ validation: { isRequired: true } }),
        createdAt: timestamp({ defaultValue: { kind: 'now' } }),
      },
    }),
  },
});
