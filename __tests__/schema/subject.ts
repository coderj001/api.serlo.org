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

import { taxonomyTermSubject } from '../../__fixtures__'
import {
  assertSuccessfulGraphQLQuery,
  createMessageHandler,
  createTestClient,
  createUuidHandler,
} from '../__utils__'
import { encodeId } from '~/internals/graphql'
import { Instance } from '~/types'

describe('SubjectsQuery', () => {
  test('endpoint "subjects" returns list of all subjects for an instance', async () => {
    global.server.use(
      createSubjectsHandler({
        instance: taxonomyTermSubject.instance,
        subjectTaxonomyTermIds: [taxonomyTermSubject.id],
      }),
      createUuidHandler(taxonomyTermSubject)
    )

    await assertSuccessfulGraphQLQuery({
      query: gql`
        query ($instance: Instance!) {
          subject {
            subjects(instance: $instance) {
              taxonomyTerm {
                name
              }
            }
          }
        }
      `,
      variables: { instance: taxonomyTermSubject.instance },
      data: {
        subject: {
          subjects: [{ taxonomyTerm: { name: taxonomyTermSubject.name } }],
        },
      },
      client: createTestClient(),
    })
  })

  test('endpoint "subject" returns one subject', async () => {
    global.server.use(createUuidHandler(taxonomyTermSubject))

    await assertSuccessfulGraphQLQuery({
      query: gql`
        query ($id: String!) {
          subject {
            subject(id: $id) {
              taxonomyTerm {
                name
              }
            }
          }
        }
      `,
      variables: { id: encodeId({ prefix: 's', id: taxonomyTermSubject.id }) },
      data: {
        subject: {
          subject: { taxonomyTerm: { name: taxonomyTermSubject.name } },
        },
      },
      client: createTestClient(),
    })
  })
})

describe('Subjects', () => {
  test('property "id" returns encoded id of subject', async () => {})
})

function createSubjectsHandler({
  instance,
  subjectTaxonomyTermIds,
}: {
  instance: Instance
  subjectTaxonomyTermIds: number[]
}) {
  return createMessageHandler({
    message: { type: 'SubjectsQuery', payload: { instance } },
    body: { subjectTaxonomyTermIds },
  })
}
