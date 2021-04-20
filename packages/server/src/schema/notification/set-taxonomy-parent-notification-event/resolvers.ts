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
import { createNotificationEventResolvers } from '../utils'
import { TypeResolvers } from '~/internals/graphql'
import { TaxonomyTermDecoder } from '~/model/decoder'
import { SetTaxonomyParentNotificationEvent } from '~/types'

export const resolvers: TypeResolvers<SetTaxonomyParentNotificationEvent> = {
  SetTaxonomyParentNotificationEvent: {
    ...createNotificationEventResolvers(),
    async previousParent(notificationEvent, _args, { dataSources }) {
      if (notificationEvent.previousParentId === null) return null

      const parent = await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: notificationEvent.previousParentId,
        decoder: TaxonomyTermDecoder,
      })

      if (parent === null) throw new Error('parent cannot be null')

      return parent
    },
    async parent(notificationEvent, _args, { dataSources }) {
      if (notificationEvent.parentId === null) return null
      const parent = await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: notificationEvent.parentId,
        decoder: TaxonomyTermDecoder,
      })

      if (parent === null) throw new Error('parent cannot be null')

      return parent
    },
    async child(notificationEvent, _args, { dataSources }) {
      const child = await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: notificationEvent.childId,
        decoder: TaxonomyTermDecoder,
      })

      if (child === null) throw new Error('child cannot be null')

      return child
    },
  },
}