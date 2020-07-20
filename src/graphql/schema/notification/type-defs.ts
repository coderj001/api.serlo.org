/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020 Serlo Education e.V.
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
 * @copyright Copyright (c) 2020 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import { gql } from 'apollo-server'

export const typeDefs = gql`
  type Notification {
    id: Int!
    unread: Boolean
    event: NotificationEvent!
  }

  type NotificationEvent {
    id: Int!
    type: String!
    instance: Instance!
    date: DateTime!
    actor: User!
    object: Uuid!
    payload: String
  }

  extend type Query {
    notifications(
      after: String
      before: String
      first: Int
      last: Int
      unread: Boolean
    ): NotificationsResult!
  }

  extend type Mutation {
    setNotificationState(id: Int!, unread: Boolean!): Boolean
  }

  type NotificationsResult {
    edges: [NotificationCursor!]!
    nodes: [Notification!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type NotificationCursor {
    cursor: String!
    node: Notification!
  }
`
