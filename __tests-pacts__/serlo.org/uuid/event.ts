/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020 Serlo Education e.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @copyright Copyright (c) 2020 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import { gql } from 'apollo-server'
import * as R from 'ramda'

import { license } from '../../../__fixtures__/license'
import {
  event,
  eventAlias,
  eventRevision,
  taxonomyTermSubject,
  user,
} from '../../../__fixtures__/uuid'
import { assertSuccessfulGraphQLQuery } from '../../__utils__/assertions'
import {
  addAliasInteraction,
  addEventInteraction,
  addEventRevisionInteraction,
  addLicenseInteraction,
  addTaxonomyTermInteraction,
  addUserInteraction,
} from '../../__utils__/interactions'

describe('Event', () => {
  test('by alias', async () => {
    await addEventInteraction(event)
    await addAliasInteraction(eventAlias)
    await assertSuccessfulGraphQLQuery({
      query: gql`
          {
            uuid(
              alias: {
                instance: de
                path: "${eventAlias.path}"
              }
            ) {
              __typename
              ... on Event {
                id
                trashed
                instance
                alias
                date
                currentRevision {
                  id
                }
                license {
                  id
                }
              }
            }
          }
        `,
      data: {
        uuid: {
          ...R.omit(
            ['currentRevisionId', 'licenseId', 'taxonomyTermIds'],
            event
          ),
          currentRevision: {
            id: eventRevision.id,
          },
          license: {
            id: 1,
          },
        },
      },
    })
  })

  test('by alias (w/ license)', async () => {
    await addEventInteraction(event)
    await addAliasInteraction(eventAlias)
    await addLicenseInteraction(license)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(
            alias: {
              instance: de
              path: "${eventAlias.path}"
            }
          ) {
            __typename
            ... on Event {
              id
              trashed
              instance
              alias
              date
              currentRevision {
                id
              }
              license {
                id
                title
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(
            ['currentRevisionId', 'licenseId', 'taxonomyTermIds'],
            event
          ),
          currentRevision: {
            id: eventRevision.id,
          },
          license: {
            id: 1,
            title: 'title',
          },
        },
      },
    })
  })

  test('by alias (w/ currentRevision)', async () => {
    await addEventInteraction(event)
    await addAliasInteraction(eventAlias)
    await addEventRevisionInteraction(eventRevision)
    await assertSuccessfulGraphQLQuery({
      query: gql`
          {
            uuid(
              alias: {
                instance: de
                path: "${eventAlias.path}"
              }
            ) {
              __typename
              ... on Event {
                id
                trashed
                instance
                alias
                date
                currentRevision {
                  id
                  title
                  content
                  changes
                }
              }
            }
          }
        `,
      data: {
        uuid: {
          ...R.omit(
            ['currentRevisionId', 'licenseId', 'taxonomyTermIds'],
            event
          ),
          currentRevision: {
            id: eventRevision.id,
            title: 'title',
            content: 'content',
            changes: 'changes',
          },
        },
      },
    })
  })

  test('by alias (w/ taxonomyTerms)', async () => {
    await addEventInteraction(event)
    await addAliasInteraction(eventAlias)
    await addTaxonomyTermInteraction(taxonomyTermSubject)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(
            alias: {
              instance: de
              path: "${eventAlias.path}"
            }
          ) {
            __typename
            ... on Event {
              id
              trashed
              instance
              alias
              date
              taxonomyTerms {
                id
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(
            ['currentRevisionId', 'licenseId', 'taxonomyTermIds'],
            event
          ),
          taxonomyTerms: [{ id: 5 }],
        },
      },
    })
  })

  test('by id', async () => {
    await addEventInteraction(event)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(id: ${event.id}) {
            __typename
            ... on Event {
              id
              trashed
              alias
              instance
              date
              currentRevision {
                id
              }
              license {
                id
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(
            ['currentRevisionId', 'licenseId', 'taxonomyTermIds'],
            event
          ),
          currentRevision: {
            id: eventRevision.id,
          },
          license: {
            id: 1,
          },
        },
      },
    })
  })
})

describe('EventRevision', () => {
  test('by id', async () => {
    await addEventRevisionInteraction(eventRevision)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(id: ${eventRevision.id}) {
            __typename
            ... on EventRevision {
              id
              trashed
              date
              title
              content
              changes
              metaTitle
              metaDescription
              author {
                id
              }
              event {
                id
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(['authorId', 'repositoryId'], eventRevision),
          author: {
            id: 1,
          },
          event: {
            id: event.id,
          },
        },
      },
    })
  })

  test('by id (w/ author)', async () => {
    await addEventRevisionInteraction(eventRevision)
    await addUserInteraction(user)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(id: ${eventRevision.id}) {
            __typename
            ... on EventRevision {
              id
              trashed
              date
              title
              content
              changes
              metaTitle
              metaDescription
              author {
                id
                username
              }
              event {
                id
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(['authorId', 'repositoryId'], eventRevision),
          author: {
            id: 1,
            username: user.username,
          },
          event: {
            id: event.id,
          },
        },
      },
    })
  })

  test('by id (w/ event)', async () => {
    await addEventRevisionInteraction(eventRevision)
    await addEventInteraction(event)
    await assertSuccessfulGraphQLQuery({
      query: gql`
        {
          uuid(id: ${eventRevision.id}) {
            __typename
            ... on EventRevision {
              id
              trashed
              date
              title
              content
              changes
              metaTitle
              metaDescription
              author {
                id
              }
              event {
                id
                currentRevision {
                  id
                }
              }
            }
          }
        }
      `,
      data: {
        uuid: {
          ...R.omit(['authorId', 'repositoryId'], eventRevision),
          author: {
            id: 1,
          },
          event: {
            id: event.id,
            currentRevision: {
              id: eventRevision.id,
            },
          },
        },
      },
    })
  })
})