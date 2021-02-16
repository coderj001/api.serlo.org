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
import { Matchers } from '@pact-foundation/pact'
import fetch from 'node-fetch'

import { addJsonInteraction, addMessageInteraction } from '../__utils__'

test('ActiveAuthorsQuery', async () => {
  await addMessageInteraction({
    given: 'users with ids 1 and 10 are active authors',
    message: {
      type: 'ActiveAuthorsQuery',
    },
    responseBody: Matchers.eachLike(1),
  })

  const response = await global.serloModel.getActiveAuthorIds()
  expect(response).toEqual([1])
})

test('GET /api/user/active-reviewers', async () => {
  await addJsonInteraction({
    name: 'fetch list of active reviewer ids',
    given: 'users with ids 1 and 10 are active reviewers',
    path: '/user/active-reviewers',
    body: Matchers.eachLike(1),
  })

  await fetch(
    `http://${process.env.SERLO_ORG_DATABASE_LAYER_HOST}/user/active-reviewers`
  )
})
