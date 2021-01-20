/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2021 Serlo Education e.V.
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
 * @copyright Copyright (c) 2021 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import * as R from 'ramda'

import { EntityRevisionType, EntityType } from '../abstract-entity'
import { AbstractUuidPayload, UuidResolvers } from '../abstract-uuid'
import { createAliasResolvers } from '../alias'
import { DiscriminatorType } from './types'

const validTypes = [
  ...Object.values(DiscriminatorType),
  ...Object.values(EntityType),
  ...Object.values(EntityRevisionType),
]

export function isUnsupportedUuid(payload: AbstractUuidPayload) {
  return !R.includes(payload.__typename, validTypes)
}

export function createUuidResolvers(): UuidResolvers {
  return createAliasResolvers()
}