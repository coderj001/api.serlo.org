/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020-2021 Serlo Education e.V.
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
 * @copyright Copyright (c) 2020-2021 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import { gql } from 'apollo-server'

import {
  applet,
  appletRevision,
  getAppletDataWithoutSubResolvers,
  getAppletRevisionDataWithoutSubResolvers,
} from '../../../__fixtures__'
import {
  assertSuccessfulGraphQLQuery,
  Client,
  createTestClient,
  createUuidHandler,
} from '../../__utils__'

let client: Client

beforeEach(() => {
  client = createTestClient()
})

test('Applet', async () => {
  global.server.use(createUuidHandler(applet))
  await assertSuccessfulGraphQLQuery({
    query: gql`
      query applet($id: Int!) {
        uuid(id: $id) {
          __typename
          ... on Applet {
            id
            trashed
            instance
            date
          }
        }
      }
    `,
    variables: applet,
    data: {
      uuid: getAppletDataWithoutSubResolvers(applet),
    },
    client,
  })
})

test('AppletRevision', async () => {
  global.server.use(createUuidHandler(appletRevision))
  await assertSuccessfulGraphQLQuery({
    query: gql`
      query appletRevision($id: Int!) {
        uuid(id: $id) {
          __typename
          ... on AppletRevision {
            id
            trashed
            date
            url
            title
            content
            changes
            metaTitle
            metaDescription
          }
        }
      }
    `,
    variables: appletRevision,
    data: {
      uuid: getAppletRevisionDataWithoutSubResolvers(appletRevision),
    },
    client,
  })
})
