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
import { Scope } from '@serlo/authorization'
import { gql } from 'apollo-server'

import { user as admin } from '../../../__fixtures__'
import { Client, given, Query } from '../../__utils__'
import { Instance, Role } from '~/types'

let client: Client
let mutation: Query
let uuidQuery: Query

const globalRole = Role.Sysadmin
const scopedRole = Role.Reviewer
const instance = Instance.De

beforeEach(() => {
  client = new Client({ userId: admin.id })
  mutation = client
    .prepareQuery({
      query: gql`
        mutation ($input: UserRoleInput!) {
          user {
            removeRole(input: $input) {
              success
            }
          }
        }
      `,
    })
    .withInput({
      username: admin.username,
      role: globalRole,
    })

  uuidQuery = client
    .prepareQuery({
      query: gql`
        query ($id: Int!) {
          uuid(id: $id) {
            __typename
            ... on User {
              roles {
                nodes {
                  role
                  scope
                }
              }
            }
          }
        }
      `,
    })
    .withVariables({ id: admin.id })

  given('UuidQuery').for(admin)
  given('AliasQuery')
    .withPayload({
      instance: Instance.De,
      path: `user/profile/${admin.username}`,
    })
    .returns({
      id: admin.id,
      instance: Instance.De,
      path: `/user/${admin.id}/${admin.username}`,
    })
})

describe('remove global role', () => {
  beforeEach(() => {
    given('UserRemoveRoleMutation')
      .withPayload({ roleName: globalRole, username: admin.username })
      .returns({ success: true })
  })

  test('removes a role successfully', async () => {
    await mutation.shouldReturnData({ user: { removeRole: { success: true } } })
  })

  test('ignores instance when given one', async () => {
    await mutation
      .withInput({ username: admin.username, role: globalRole, instance })
      .shouldReturnData({ user: { removeRole: { success: true } } })
  })

  test('fails when only scoped admin', async () => {
    await mutation.forLoginUser('en_admin').shouldFailWithError('FORBIDDEN')
  })
})

describe('remove scoped role', () => {
  beforeEach(() => {
    given('UserRemoveRoleMutation')
      .withPayload({
        roleName: `${instance}_${scopedRole}`,
        username: admin.username,
      })
      .returns({ success: true })
  })

  test('removes a role successfully', async () => {
    await mutation
      .withInput({ username: admin.username, role: scopedRole, instance })
      .shouldReturnData({ user: { removeRole: { success: true } } })
  })

  test('removes a role successfully when scoped admin', async () => {
    await mutation
      .forLoginUser('de_admin')
      .withInput({ username: admin.username, role: scopedRole, instance })
      .shouldReturnData({ user: { removeRole: { success: true } } })
  })

  test('fails when admin in wrong scope', async () => {
    await mutation
      .withInput({ username: admin.username, role: scopedRole, instance })
      .forLoginUser('en_admin')
      .shouldFailWithError('FORBIDDEN')
  })

  test('fails when not given an instance', async () => {
    await mutation
      .withInput({ username: admin.username, role: scopedRole })
      .shouldFailWithError('BAD_USER_INPUT')
  })
})

test('updates the cache', async () => {
  given('UserRemoveRoleMutation').returns({ success: true })

  await uuidQuery.shouldReturnData({
    uuid: {
      roles: {
        nodes: [
          {
            role: Role.Login,
            scope: Scope.Serlo,
          },
          {
            role: globalRole,
            scope: Scope.Serlo,
          },
        ],
      },
    },
  })
  await mutation.execute()
  await uuidQuery.shouldReturnData({
    uuid: { roles: { nodes: [{ role: Role.Login, scope: Scope.Serlo }] } },
  })
})

test('fails when user is not authenticated', async () => {
  await mutation.forUnauthenticatedUser().shouldFailWithError('UNAUTHENTICATED')
})

test('fails when user does not have role "admin"', async () => {
  await mutation.forLoginUser('en_reviewer').shouldFailWithError('FORBIDDEN')
})

test('fails when database layer has an internal error', async () => {
  given('UserRemoveRoleMutation').hasInternalServerError()

  await mutation.shouldFailWithError('INTERNAL_SERVER_ERROR')
})
