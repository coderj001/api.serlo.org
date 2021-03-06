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
import {
  AbstractExerciseDecoder,
  SolutionDecoder,
  SolutionRevisionDecoder,
} from '~/model'
import { TypeResolvers } from '~/schema/utils'
import {
  createRepositoryResolvers,
  createRevisionResolvers,
} from '~/schema/uuid/abstract-repository/utils'
import { Solution, SolutionRevision } from '~/types'

export const resolvers: TypeResolvers<Solution> &
  TypeResolvers<SolutionRevision> = {
  Solution: {
    ...createRepositoryResolvers({ decoder: SolutionRevisionDecoder }),
    async exercise(solution, _args, { dataSources }) {
      const exercise = await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: solution.parentId,
        decoder: AbstractExerciseDecoder,
      })

      if (exercise === null) throw new Error('exercise cannot be null')

      return exercise
    },
  },
  SolutionRevision: createRevisionResolvers({ decoder: SolutionDecoder }),
}
