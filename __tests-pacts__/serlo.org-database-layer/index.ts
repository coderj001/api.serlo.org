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
/* eslint-disable import/no-unassigned-import */
describe('GET /alias/:instance/:alias', () => {
  require('./alias')
})
describe('GET /event/:id', () => {
  require('./event')
})
describe('GET /navigation/:instance', () => {
  require('./navigation')
})
describe('GET /notifications/:id', () => {
  require('./notifications')
})
describe('GET /subscriptions', () => {
  require('./subscriptions')
})
describe('GET /threads/:id', () => {
  require('./threads/threads')
})
describe('GET /user/:id', () => {
  require('./user')
})
describe('GET /uuid/:id', () => {
  require('./uuid')
})
describe('POST /set-uuid-state', () => {
  require('./set-uuid-state')
})
describe('POST /set-notification-state', () => {
  require('./set-notification-state')
})
describe('POST /thread/set-archive', () => {
  require('./threads/thread-set-archive')
})
describe('POST /thread/start-thread', () => {
  require('./threads/start-thread')
})
describe('POST /thread/comment-thread', () => {
  require('./threads/comment-thread')
})

describe('LicenseMessage', () => {
  require('./license')
})
describe('SubscriptionSetMutation', () => {
  require('./subscription-set-mutation')
})
