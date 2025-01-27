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
import * as auth from '@serlo/authorization'
import { UserInputError } from 'apollo-server-core'
import * as t from 'io-ts'

import {
  decodeThreadId,
  decodeThreadIds,
  encodeThreadId,
  resolveThreads,
} from './utils'
import {
  assertUserIsAuthenticated,
  assertUserIsAuthorized,
  createNamespace,
  InterfaceResolvers,
  Mutations,
  TypeResolvers,
  Model,
  Context,
  Queries,
} from '~/internals/graphql'
import { DiscriminatorType, UserDecoder, UuidDecoder } from '~/model/decoder'
import { fetchScopeOfUuid } from '~/schema/authorization/utils'
import { resolveConnection } from '~/schema/connection/utils'
import { decodeSubjectId } from '~/schema/subject/utils'
import { createUuidResolvers } from '~/schema/uuid/abstract-uuid/utils'
import { Comment, Thread } from '~/types'
import { isDefined } from '~/utils'

export const resolvers: InterfaceResolvers<'ThreadAware'> &
  Mutations<'thread'> &
  TypeResolvers<Thread> &
  TypeResolvers<Comment> &
  Queries<'thread'> = {
  ThreadAware: {
    __resolveType(parent) {
      return parent.__typename
    },
  },
  Query: {
    thread: createNamespace(),
  },
  ThreadQuery: {
    async allThreads(_parent, input, { dataSources }) {
      const subjectId = input.subjectId
        ? decodeSubjectId(input.subjectId)
        : null
      const limit = 50
      const { first = 10, instance } = input
      // TODO: Better solution
      const after = input.after
        ? Buffer.from(input.after, 'base64').toString()
        : undefined

      if (first && first > limit)
        throw new UserInputError(`"first" cannot be larger than ${limit}`)

      const filteredThreads = await filterThreads({
        first: first + 1,
        threadsToFetch: first + 1,
        after,
      })

      return resolveConnection({
        nodes: filteredThreads,
        payload: { ...input, first, after },
        createCursor: (node) => {
          const comments = node.commentPayloads
          const latestComment = comments[comments.length - 1]

          return latestComment.date
        },
      })

      async function filterThreads({
        first,
        after,
        threadsToFetch,
      }: {
        threadsToFetch: number
        first: number
        after: string | undefined
      }): Promise<Model<'Thread'>[]> {
        const { firstCommentIds } = await dataSources.model.serlo.getAllThreads(
          {
            first: threadsToFetch,
            after,
            instance,
          }
        )

        const threads = await resolveThreads({ firstCommentIds, dataSources })
        const mappedThreads = await Promise.all(
          threads.map(async (thread) => {
            if (subjectId == null) return thread

            const entity = await dataSources.model.serlo.getUuid({
              id: thread.commentPayloads[0].parentId,
            })

            if (
              t.type({ canonicalSubjectId: t.number }).is(entity) &&
              entity.canonicalSubjectId === subjectId
            )
              return thread

            return null
          })
        )
        const filteredThreads = mappedThreads.filter(isDefined)
        if (
          filteredThreads.length < first &&
          threads.length === threadsToFetch
        ) {
          return filteredThreads.concat(
            await filterThreads({
              first: first - filteredThreads.length,
              after: threads.at(-1)?.commentPayloads?.at(-1)?.date,
              threadsToFetch,
            })
          )
        } else {
          return filteredThreads.slice(0, first)
        }
      }
    },
  },
  Thread: {
    id(thread) {
      return encodeThreadId(thread.commentPayloads[0].id)
    },
    createdAt(thread) {
      return thread.commentPayloads[0].date
    },
    title(thread) {
      return thread.commentPayloads[0].title
    },
    archived(thread) {
      return thread.commentPayloads[0].archived
    },
    trashed(thread) {
      return thread.commentPayloads[0].trashed
    },
    async object(thread, _args, { dataSources }) {
      return await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: thread.commentPayloads[0].parentId,
        decoder: UuidDecoder,
      })
    },
    comments(thread, cursorPayload) {
      return resolveConnection({
        nodes: thread.commentPayloads.sort((a, b) => a.id - b.id),
        payload: cursorPayload,
        createCursor(node) {
          return node.id.toString()
        },
      })
    },
  },
  Comment: {
    ...createUuidResolvers(),
    createdAt(comment) {
      return comment.date
    },
    async author(comment, _args, { dataSources }) {
      return await dataSources.model.serlo.getUuidWithCustomDecoder({
        id: comment.authorId,
        decoder: UserDecoder,
      })
    },
    async legacyObject(comment, _args, { dataSources }) {
      return resolveObject(comment, dataSources)
    },
  },
  Mutation: {
    thread: createNamespace(),
  },
  ThreadMutation: {
    async createThread(_parent, payload, { dataSources, userId }) {
      const { objectId } = payload.input
      const scope = await fetchScopeOfUuid({ id: objectId, dataSources })

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guard: auth.Thread.createThread(scope),
        message: 'You are not allowed to create a thread on this object.',
        dataSources,
      })

      const commentPayload = await dataSources.model.serlo.createThread({
        ...payload.input,
        userId,
      })
      const success = commentPayload !== null
      return {
        record:
          commentPayload !== null
            ? { __typename: 'Thread', commentPayloads: [commentPayload] }
            : null,
        success,
        query: {},
      }
    },
    async createComment(_parent, { input }, { dataSources, userId }) {
      const threadId = decodeThreadId(input.threadId)
      const scope = await fetchScopeOfUuid({ id: threadId, dataSources })

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guard: auth.Thread.createComment(scope),
        message: 'You are not allowed to comment on this thread.',
        dataSources,
      })

      const commentPayload = await dataSources.model.serlo.createComment({
        ...input,
        threadId,
        userId,
      })

      return {
        record: commentPayload,
        success: commentPayload !== null,
        query: {},
      }
    },
    async editComment(_parent, { input }, { dataSources, userId }) {
      const commentId = input.commentId
      const scope = await fetchScopeOfUuid({ id: commentId, dataSources })

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guard: auth.Thread.createThread(scope),
        message: 'You are not allowed to edit this thread or comment.',
        dataSources,
      })

      await dataSources.model.serlo.editComment({
        ...input,
        commentId,
        userId,
      })

      return {
        success: true,
        query: {},
      }
    },
    async setThreadArchived(_parent, payload, { dataSources, userId }) {
      const { id, archived } = payload.input
      const ids = decodeThreadIds(id)

      const scopes = await Promise.all(
        ids.map((id) => fetchScopeOfUuid({ id, dataSources }))
      )

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guards: scopes.map((scope) => auth.Thread.setThreadArchived(scope)),
        message: 'You are not allowed to archive the provided thread(s).',
        dataSources,
      })

      await dataSources.model.serlo.archiveThread({
        ids,
        archived,
        userId,
      })
      return { success: true, query: {} }
    },
    async setThreadState(_parent, payload, { dataSources, userId }) {
      const { trashed } = payload.input
      const ids = decodeThreadIds(payload.input.id)

      const scopes = await Promise.all(
        ids.map((id) => fetchScopeOfUuid({ id, dataSources }))
      )

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guards: scopes.map((scope) => auth.Thread.setThreadState(scope)),
        message:
          'You are not allowed to set the state of the provided thread(s).',
        dataSources,
      })

      await dataSources.model.serlo.setUuidState({ ids, userId, trashed })

      return { success: true, query: {} }
    },
    async setCommentState(_parent, payload, { dataSources, userId }) {
      const { id: ids, trashed } = payload.input

      const scopes = await Promise.all(
        ids.map((id) => fetchScopeOfUuid({ id, dataSources }))
      )

      assertUserIsAuthenticated(userId)
      await assertUserIsAuthorized({
        userId,
        guards: scopes.map((scope) => auth.Thread.setCommentState(scope)),
        message:
          'You are not allowed to set the state of the provided comments(s).',
        dataSources,
      })

      await dataSources.model.serlo.setUuidState({ ids, trashed, userId })

      return { success: true, query: {} }
    },
  },
}

async function resolveObject(
  comment: Model<'Comment'>,
  dataSources: Context['dataSources']
): Promise<Model<'AbstractUuid'>> {
  const obj = await dataSources.model.serlo.getUuidWithCustomDecoder({
    id: comment.parentId,
    decoder: UuidDecoder,
  })

  return obj.__typename === DiscriminatorType.Comment
    ? resolveObject(obj, dataSources)
    : obj
}
