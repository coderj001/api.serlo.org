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
import { A } from 'ts-toolbelt'

import { modelFactories } from '~/model'
import { Models } from '~/model/types'
import { Connection } from '~/schema/connection/types'

/**
 * Given a GraphQL type it computes the model type of the GraphQL type based
 * on the following rules.
 */
export type ModelOf<T> = A.Equals<T, unknown> extends 1
  ? T
  : T extends boolean | string | number | null
  ? T
  : Typename<T> extends keyof Models
  ? Models[Typename<T>]
  : Typename<T> extends `${string}${'Mutation' | 'Query'}`
  ? Record<string, never>
  : T extends { nodes: Array<infer U>; totalCount: number }
  ? Connection<ModelOf<U>>
  : T extends (infer U)[]
  ? ModelOf<U>[]
  : T extends object
  ? { [P in keyof T]: ModelOf<T[P]> }
  : never

/**
 * Given a GraphQL type it returns the name of the GraphQL type as a string.
 *
 * @example
 * import { Article } from '~/types'
 *
 * type A = Typename<Article> // A equals "Article"
 */
export type Typename<T> = T extends { __typename?: infer U }
  ? U extends string
    ? U
    : '__not_a_graphql_type'
  : '__not_a_graphql_type'

export type Payload<
  M extends keyof AllPayloads,
  P extends keyof AllPayloads[M]
> = AllPayloads[M][P]

export type AllPayloads = {
  [M in keyof ModelFactories]: Payloads<ReturnType<ModelFactories[M]>>
}
export type Payloads<M> = {
  [F in keyof M]: NonNullable<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A.PromiseOf<M[F] extends (...args: any) => infer R ? R : never>
  >
}

export type ModelFactories = typeof modelFactories
