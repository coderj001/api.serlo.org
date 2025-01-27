/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020-2023 Serlo Education e.V.
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
 * @copyright Copyright (c) 2020-2023 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import { gql } from 'apollo-server'
import * as R from 'ramda'

import { page, pageRevision, user as baseUser } from '../../../__fixtures__'
import { given, Client, nextUuid } from '../../__utils__'

const user = { ...baseUser, roles: ['de_static_pages_builder'] }

describe('PageAddRevisionMutation', () => {
  const input = {
    content: 'new content',
    title: 'new title',
    pageId: page.id,
  }

  const mutation = new Client({ userId: user.id })
    .prepareQuery({
      query: gql`
        mutation set($input: PageAddRevisionInput!) {
          page {
            addRevision(input: $input) {
              success
              revisionId
            }
          }
        }
      `,
    })
    .withVariables({ input })

  const newRevisionId = nextUuid(pageRevision.id)

  beforeEach(() => {
    given('UuidQuery').for(user, page, pageRevision)
    given('PageAddRevisionMutation').isDefinedBy((req, res, ctx) => {
      // const { title, content } = req.body.payload
      const newRevision = {
        ...pageRevision,
        ...R.pick(['title', 'content'], req.body.payload),
        id: newRevisionId,
      }
      given('UuidQuery').for(newRevision)
      given('UuidQuery').for({
        ...page,
        revisionIds: [newRevision.id, ...page.revisionIds],
        currentRevisionId: newRevision.id,
      })
      return res(ctx.json({ success: true, revisionId: newRevision.id }))
    })
  })

  test('returns "{ success: true }" when mutation could be successfully executed', async () => {
    await mutation.shouldReturnData({
      page: { addRevision: { success: true, revisionId: newRevisionId } },
    })
  })

  test('updates the cache', async () => {
    const query = new Client({ userId: user.id })
      .prepareQuery({
        query: gql`
          query ($id: Int!) {
            uuid(id: $id) {
              ... on Page {
                currentRevision {
                  id
                  content
                  title
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: page.id })

    await query.shouldReturnData({
      uuid: {
        currentRevision: {
          id: pageRevision.id,
          content: pageRevision.content,
          title: pageRevision.title,
        },
      },
    })

    await mutation.execute()

    await query.shouldReturnData({
      uuid: {
        currentRevision: {
          id: newRevisionId,
          content: input.content,
          title: input.title,
        },
      },
    })
  })

  test('fails when user is not authenticated', async () => {
    await mutation
      .forUnauthenticatedUser()
      .shouldFailWithError('UNAUTHENTICATED')
  })

  test('fails when user does not have role "static_pages_builder"', async () => {
    await mutation.forLoginUser().shouldFailWithError('FORBIDDEN')
  })

  test('fails when `title` or `content` is empty', async () => {
    await mutation
      .withInput({
        content: '',
        title: 'title',
        pageId: page.id,
      })
      .shouldFailWithError('BAD_USER_INPUT')

    await mutation
      .withInput({
        content: 'content',
        title: '',
        pageId: page.id,
      })
      .shouldFailWithError('BAD_USER_INPUT')
  })

  test('fails when database layer returns a 400er response', async () => {
    given('PageAddRevisionMutation').returnsBadRequest()

    await mutation.shouldFailWithError('BAD_USER_INPUT')
  })

  test('fails when database layer has an internal error', async () => {
    given('PageAddRevisionMutation').hasInternalServerError()

    await mutation.shouldFailWithError('INTERNAL_SERVER_ERROR')
  })
})
