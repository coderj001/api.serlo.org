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
import * as R from 'ramda'

import { exercise, groupedExercise, solution } from '../../../__fixtures__'
import {
  assertSuccessfulGraphQLQuery,
  Client,
  createTestClient,
  createUuidHandler,
  getTypenameAndId,
} from '../../__utils__'
import { Model } from '~/internals/graphql'
import { EntityType } from '~/model/decoder'

let client: Client

beforeEach(() => {
  client = createTestClient()
})

const exerciseFixtures: Record<string, Model<'AbstractExercise'>> = {
  [EntityType.Exercise]: exercise,
  [EntityType.GroupedExercise]: groupedExercise,
}
const exerciseCases = R.toPairs(exerciseFixtures)

test.each(exerciseCases)('%s by id (w/ solution)', async (_type, entity) => {
  global.server.use(createUuidHandler(entity), createUuidHandler(solution))
  await assertSuccessfulGraphQLQuery({
    query: `
      query solution($id: Int!) {
        uuid(id: $id) {
          ... on AbstractExercise {
            solution {
              __typename
              id
            }
          }
        }
      }
    `,
    variables: { id: entity.id },
    data: { uuid: { solution: getTypenameAndId(solution) } },
    client,
  })
})
