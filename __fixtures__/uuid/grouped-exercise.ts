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
import { exerciseGroup } from './exercise-group'
import { user } from './user'
import { license } from '../license'
import { Model } from '~/internals/graphql'
import { Payload } from '~/internals/model'
import {
  castToAlias,
  castToNonEmptyString,
  castToUuid,
  EntityRevisionType,
  EntityType,
} from '~/model/decoder'
import { Instance } from '~/types'

export const groupedExerciseAlias: Payload<'serlo', 'getAlias'> = {
  id: 2219,
  instance: Instance.De,
  path: '/2219/2219',
}

export const groupedExercise: Model<'GroupedExercise'> = {
  __typename: EntityType.GroupedExercise,
  id: castToUuid(2219),
  trashed: false,
  instance: Instance.De,
  alias: castToAlias('/mathe/2219/2219'),
  date: '2014-03-01T20:45:56Z',
  currentRevisionId: castToUuid(2220),
  revisionIds: [2220].map(castToUuid),
  licenseId: license.id,
  solutionId: castToUuid(29648),
  parentId: exerciseGroup.id,
  canonicalSubjectId: castToUuid(5),
}

export const groupedExerciseRevision: Model<'GroupedExerciseRevision'> = {
  __typename: EntityRevisionType.GroupedExerciseRevision,
  id: castToUuid(2220),
  trashed: false,
  alias: castToAlias('/mathe/2220/2220'),
  date: '2014-09-15T15:28:35Z',
  authorId: user.id,
  repositoryId: groupedExercise.id,
  content: castToNonEmptyString('content'),
  changes: 'changes',
}
