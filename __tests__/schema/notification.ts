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

import {
  article,
  articleRevision,
  comment,
  createCommentNotificationEvent,
  createEntityNotificationEvent,
  createEntityRevisionNotificationEvent,
  createThreadNotificationEvent,
  getArticleDataWithoutSubResolvers,
  getArticleRevisionDataWithoutSubResolvers,
  getCreateCommentNotificationEventDataWithoutSubResolvers,
  getCreateEntityNotificationEventDataWithoutSubResolvers,
  getCreateEntityRevisionNotificationEventDataWithoutSubResolvers,
  getCreateThreadNotificationEventDataWithoutSubResolvers,
  getSetThreadStateNotificationEventDataWithoutSubResolvers,
  setThreadStateNotificationEvent,
  thread,
  user,
} from '../../__fixtures__'
import { Service } from '../../src/graphql/schema/types'
import {
  assertSuccessfulGraphQLQuery,
  Client,
  createNotificationEventHandler,
  createTestClient,
  createUuidHandler,
} from '../__utils__'

let client: Client

beforeEach(() => {
  client = createTestClient({
    service: Service.Playground,
    user: null,
  }).client
})

describe('CreateCommentNotificationEvent', () => {
  beforeEach(() => {
    global.server.use(
      createNotificationEventHandler(createCommentNotificationEvent)
    )
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            __typename
            ... on CreateCommentNotificationEvent {
              id
              instance
              date
            }
          }
        }
      `,
      variables: createCommentNotificationEvent,
      data: {
        notificationEvent: getCreateCommentNotificationEventDataWithoutSubResolvers(
          createCommentNotificationEvent
        ),
      },
      client,
    })
  })

  test('by id (w/ author)', async () => {
    global.server.use(createUuidHandler(user))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateCommentNotificationEvent {
              author {
                __typename
                id
                trashed
                username
                date
                lastLogin
                description
              }
            }
          }
        }
      `,
      variables: createCommentNotificationEvent,
      data: {
        notificationEvent: {
          author: user,
        },
      },
      client,
    })
  })

  test('by id (w/ thread)', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateCommentNotificationEvent {
              thread {
                id
              }
            }
          }
        }
      `,
      variables: createCommentNotificationEvent,
      data: {
        notificationEvent: {
          thread,
        },
      },
      client,
    })
  })

  test('by id (w/ comment)', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateCommentNotificationEvent {
              comment {
                id
              }
            }
          }
        }
      `,
      variables: createCommentNotificationEvent,
      data: {
        notificationEvent: {
          comment,
        },
      },
      client,
    })
  })
})

describe('CreateEntityNotificationEvent', () => {
  beforeEach(() => {
    global.server.use(
      createNotificationEventHandler(createEntityNotificationEvent)
    )
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            __typename
            ... on CreateEntityNotificationEvent {
              id
              instance
              date
            }
          }
        }
      `,
      variables: createEntityNotificationEvent,
      data: {
        notificationEvent: getCreateEntityNotificationEventDataWithoutSubResolvers(
          createEntityNotificationEvent
        ),
      },
      client,
    })
  })

  test('by id (w/ author)', async () => {
    global.server.use(createUuidHandler(user))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateEntityNotificationEvent {
              author {
                __typename
                id
                trashed
                username
                date
                lastLogin
                description
              }
            }
          }
        }
      `,
      variables: createEntityNotificationEvent,
      data: {
        notificationEvent: {
          author: user,
        },
      },
      client,
    })
  })

  test('by id (w/ entity)', async () => {
    global.server.use(createUuidHandler(article))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateEntityNotificationEvent {
              entity {
                __typename
                ... on Article {
                  id
                  trashed
                  alias
                  instance
                  date
                }
              }
            }
          }
        }
      `,
      variables: createEntityNotificationEvent,
      data: {
        notificationEvent: {
          entity: getArticleDataWithoutSubResolvers(article),
        },
      },
      client,
    })
  })
})

describe('CreateEntityRevisionNotificationEvent', () => {
  beforeEach(() => {
    global.server.use(
      createNotificationEventHandler(createEntityRevisionNotificationEvent)
    )
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            __typename
            ... on CreateEntityRevisionNotificationEvent {
              id
              instance
              date
            }
          }
        }
      `,
      variables: createEntityRevisionNotificationEvent,
      data: {
        notificationEvent: getCreateEntityRevisionNotificationEventDataWithoutSubResolvers(
          createEntityRevisionNotificationEvent
        ),
      },
      client,
    })
  })

  test('by id (w/ author)', async () => {
    global.server.use(createUuidHandler(user))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateEntityRevisionNotificationEvent {
              author {
                __typename
                id
                trashed
                username
                date
                lastLogin
                description
              }
            }
          }
        }
      `,
      variables: createEntityRevisionNotificationEvent,
      data: {
        notificationEvent: {
          author: user,
        },
      },
      client,
    })
  })

  test('by id (w/ entity)', async () => {
    global.server.use(createUuidHandler(article))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateEntityRevisionNotificationEvent {
              entity {
                __typename
                ... on Article {
                  id
                  trashed
                  alias
                  instance
                  date
                }
              }
            }
          }
        }
      `,
      variables: createEntityRevisionNotificationEvent,
      data: {
        notificationEvent: {
          entity: getArticleDataWithoutSubResolvers(article),
        },
      },
      client,
    })
  })

  test('by id (w/ entityRevision)', async () => {
    global.server.use(createUuidHandler(articleRevision))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateEntityRevisionNotificationEvent {
              entityRevision {
                __typename
                ... on ArticleRevision {
                  id
                  trashed
                  date
                  title
                  content
                  changes
                  metaTitle
                  metaDescription
                }
              }
            }
          }
        }
      `,
      variables: createEntityRevisionNotificationEvent,
      data: {
        notificationEvent: {
          entityRevision: getArticleRevisionDataWithoutSubResolvers(
            articleRevision
          ),
        },
      },
      client,
    })
  })
})

describe('CreateThreadNotificationEvent', () => {
  beforeEach(() => {
    global.server.use(
      createNotificationEventHandler(createThreadNotificationEvent)
    )
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            __typename
            ... on CreateThreadNotificationEvent {
              id
              instance
              date
            }
          }
        }
      `,
      variables: createThreadNotificationEvent,
      data: {
        notificationEvent: getCreateThreadNotificationEventDataWithoutSubResolvers(
          createThreadNotificationEvent
        ),
      },
      client,
    })
  })

  test('by id (w/ author)', async () => {
    global.server.use(createUuidHandler(user))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateThreadNotificationEvent {
              author {
                __typename
                id
                trashed
                username
                date
                lastLogin
                description
              }
            }
          }
        }
      `,
      variables: createThreadNotificationEvent,
      data: {
        notificationEvent: {
          author: user,
        },
      },
      client,
    })
  })

  test('by id (w/ object)', async () => {
    global.server.use(createUuidHandler(article))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateThreadNotificationEvent {
              object {
                __typename
                ... on Article {
                  id
                  trashed
                  alias
                  instance
                  date
                }
              }
            }
          }
        }
      `,
      variables: createThreadNotificationEvent,
      data: {
        notificationEvent: {
          object: getArticleDataWithoutSubResolvers(article),
        },
      },
      client,
    })
  })

  test('by id (w/ thread)', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on CreateThreadNotificationEvent {
              thread {
                id
              }
            }
          }
        }
      `,
      variables: createThreadNotificationEvent,
      data: {
        notificationEvent: {
          thread,
        },
      },
      client,
    })
  })
})

describe('SetThreadStateNotificationEvent', () => {
  beforeEach(() => {
    global.server.use(
      createNotificationEventHandler(setThreadStateNotificationEvent)
    )
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            __typename
            ... on SetThreadStateNotificationEvent {
              id
              instance
              date
              archived
            }
          }
        }
      `,
      variables: setThreadStateNotificationEvent,
      data: {
        notificationEvent: getSetThreadStateNotificationEventDataWithoutSubResolvers(
          setThreadStateNotificationEvent
        ),
      },
      client,
    })
  })

  test('by id (w/ actor)', async () => {
    global.server.use(createUuidHandler(user))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on SetThreadStateNotificationEvent {
              actor {
                __typename
                id
                trashed
                username
                date
                lastLogin
                description
              }
            }
          }
        }
      `,
      variables: setThreadStateNotificationEvent,
      data: {
        notificationEvent: {
          actor: user,
        },
      },
      client,
    })
  })

  test('by id (w/ thread)', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notificationEvent($id: Int!) {
          notificationEvent(id: $id) {
            ... on SetThreadStateNotificationEvent {
              thread {
                id
              }
            }
          }
        }
      `,
      variables: setThreadStateNotificationEvent,
      data: {
        notificationEvent: {
          thread,
        },
      },
      client,
    })
  })
})
