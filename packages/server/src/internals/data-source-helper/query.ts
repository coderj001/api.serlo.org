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
import { option as O, either as E } from 'fp-ts'
import * as t from 'io-ts'
import reporter from 'io-ts-reporters'
import * as R from 'ramda'

import { InvalidCurrentValueError } from './common'
import { FunctionOrValue } from '../cache'
import { Environment } from '../environment'
import { Time } from '../swr-queue'
import { captureErrorEvent } from '~/internals/error-event'

/**
 * Helper function to create a query in a data source. A query operation is a
 * "read" operation whose result shall be cached by the API.
 */
export function createQuery<P, R>(
  spec: QuerySpec<P, R>,
  environment: Environment
): Query<P, R> {
  async function queryWithDecoder<S extends R>(
    payload: P,
    customDecoder?: t.Type<S, unknown>
  ): Promise<S> {
    const key = spec.getKey(payload)
    const cacheValue = await environment.cache.get<R>({
      key,
      maxAge: spec.maxAge,
    })

    const decoder = customDecoder ?? t.unknown

    let invalidCacheValueErrorContext: {
      timeInvalidCacheSaved: string
      invalidCacheValue: unknown
      source: string
      validationErrors: string[]
    } | null = null

    if (O.isSome(cacheValue)) {
      const cacheEntry = cacheValue.value
      const decodedCacheValue = decoder.decode(cacheEntry.value)

      if (E.isRight(decodedCacheValue)) {
        if (
          spec.swrFrequency === undefined ||
          Math.random() < spec.swrFrequency
        ) {
          await environment.swrQueue.queue({ key, cacheEntry: cacheValue })
        }

        return decodedCacheValue.right as S
      } else {
        invalidCacheValueErrorContext = {
          timeInvalidCacheSaved: new Date(
            cacheEntry.lastModified
          ).toISOString(),
          invalidCacheValue: cacheEntry.value,
          source: cacheEntry.source,
          validationErrors: reporter.report(decodedCacheValue),
        }
      }
    }

    // Cache empty or invalid value
    const value = await spec.getCurrentValue(payload, null)
    const decoded = decoder.decode(value)

    if (E.isRight(decoded)) {
      await environment.cache.set({
        key,
        value: decoded.right,
        source: 'API: From a call to a data source',
      })

      if (invalidCacheValueErrorContext) {
        captureErrorEvent({
          error: new Error(
            'Invalid cached value received that could be repaired automatically by data source.'
          ),
          fingerprint: ['invalid-value', 'cache', key],
          errorContext: {
            ...invalidCacheValueErrorContext,
            key,
            currentValue: value,
            decoder: decoder.name,
          },
        })
      }

      return value as S
    } else {
      throw new InvalidCurrentValueError({
        ...(O.isSome(cacheValue)
          ? { invalidCachedValue: cacheValue.value.value }
          : {}),
        invalidCurrentValue: value,
        decoder: decoder.name,
        validationErrors: reporter.report(decoded),
        key,
      })
    }
  }

  function query(payload: P): Promise<R> {
    return queryWithDecoder(payload, spec.decoder)
  }

  const querySpecWithHelpers: QuerySpecWithHelpers<P, R> = {
    ...spec,
    queryWithDecoder,
    async removeCache(args) {
      await Promise.all(
        toPayloadArray(args).map((payload) =>
          environment.cache.remove({ key: spec.getKey(payload) })
        )
      )
    },
    async setCache(args) {
      await Promise.all(
        toPayloadArray(args).map((payload) =>
          environment.cache.set({
            key: spec.getKey(payload),
            ...args,
            source: 'API: Cache update function after a mutation',
          })
        )
      )
    },
  }

  query._querySpec = querySpecWithHelpers
  query.__typename = 'Query'

  return query as unknown as Query<P, R>
}

/**
 * Specification object to create a query function.
 */
export interface QuerySpec<Payload, Result> {
  /**
   * io-ts decoder to check whether the result of the operation or the cached
   * value has the right type.
   */
  // TODO: this should probably be required
  decoder?: t.Type<Result, unknown>

  /**
   * Function which gets the current value. The second parameter `previousValue`
   * is the cached value and can be used to update the cached value to the
   * current one.
   */
  getCurrentValue: (
    payload: Payload,
    previousValue: Result | null
  ) => Promise<unknown>

  /**
   * Flag whether the SWR algorithm shall be used to update the cache in the
   * background.
   */
  enableSwr: boolean

  /**
   * Probability that a stale value shall be updated in the background when
   * SWR is activated. This value shall be between 0 and 1.
   */
  swrFrequency?: number

  /**
   * Age after which a value is considered to be stale in the SWR algorithm.
   */
  staleAfter?: Time

  /**
   * Time after which the cached value is considered to be so old that it will
   * be updated directly
   */
  maxAge?: Time

  /**
   * Function which calculates the cache key based on the passed payload. It is
   * important that cache keys are unique across all queries in all data
   * sources.
   */
  getKey: (payload: Payload) => string

  /**
   * The inverse function of {@link getKey}. It shall return `O.none` in case
   * the cache key does not belong to this query.
   */
  getPayload: (key: string) => O.Option<Payload>

  examplePayload: Payload
}

/**
 * The specification object of a query extended by some helper functions.
 */
export interface QuerySpecWithHelpers<Payload, Result>
  extends QuerySpec<Payload, Result> {
  /**
   * Function to update the cache of one or many values.
   */
  setCache(
    args: PayloadArrayOrPayload<Payload> & FunctionOrValue<Result>
  ): Promise<void>

  /**
   * Function to remove a cached value.
   */
  removeCache(args: PayloadArrayOrPayload<Payload>): Promise<void>

  /**
   * Query function with a custom io-ts decoder.
   */
  queryWithDecoder<S extends Result>(
    payload: Payload,
    customDecoder: t.Type<S, unknown>
  ): Promise<S>
}

/**
 * Type of a query operation in a data source. Note that the specification
 * object is extended by some helper functions.
 */
export type Query<Payload, Result> = (Payload extends undefined
  ? () => Promise<Result>
  : (payload: Payload) => Promise<Result>) & {
  _querySpec: QuerySpecWithHelpers<Payload, Result>
  __typename: 'Query'
}

/**
 * Type guard that a certain object is a query function created by
 * {@link createQuery}.
 */
export function isQuery(query: unknown): query is Query<unknown, unknown> {
  return R.has('__typename', query) && query.__typename === 'Query'
}

type PayloadArrayOrPayload<P> = { payload: P } | { payloads: P[] }

function toPayloadArray<P>(arg: PayloadArrayOrPayload<P>): P[] {
  return R.has('payloads', arg) ? arg.payloads : [arg.payload]
}
