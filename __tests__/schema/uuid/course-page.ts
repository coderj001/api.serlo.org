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
import R from 'ramda'

import { course, coursePage, coursePageRevision } from '../../../__fixtures__'
import { getTypenameAndId, given, Client } from '../../__utils__'

describe('CoursePage', () => {
  beforeEach(() => {
    given('UuidQuery').for(coursePage)
  })

  test('by id', async () => {
    given('UuidQuery').for(coursePage)

    await new Client()
      .prepareQuery({
        query: gql`
          query coursePage($id: Int!) {
            uuid(id: $id) {
              __typename
              ... on CoursePage {
                id
                trashed
                instance
                date
              }
            }
          }
        `,
      })
      .withVariables({ id: coursePage.id })
      .shouldReturnData({
        uuid: R.pick(
          ['__typename', 'id', 'trashed', 'instance', 'date'],
          coursePage
        ),
      })
  })

  test('by id (w/ course)', async () => {
    given('UuidQuery').for(course)

    await new Client()
      .prepareQuery({
        query: gql`
          query coursePage($id: Int!) {
            uuid(id: $id) {
              ... on CoursePage {
                course {
                  __typename
                  id
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: coursePage.id })
      .shouldReturnData({ uuid: { course: getTypenameAndId(course) } })
  })

  test('CoursePageRevision', async () => {
    given('UuidQuery').for(coursePageRevision)

    await new Client()
      .prepareQuery({
        query: gql`
          query coursePageRevision($id: Int!) {
            uuid(id: $id) {
              __typename
              ... on CoursePageRevision {
                id
                trashed
                date
                title
                content
                changes
              }
            }
          }
        `,
      })
      .withVariables({ id: coursePageRevision.id })
      .shouldReturnData({
        uuid: R.pick(
          [
            '__typename',
            'id',
            'trashed',
            'date',
            'title',
            'content',
            'changes',
          ],
          coursePageRevision
        ),
      })
  })
})
