/**
 * Users are granted permissions in a specific scope. Scopes may inherit other scopes. Therefore, scopes are lay out
 * in a tree-like structure (or to be more precise, a forest-like structure). For now, we have a scope for each
 * instance (e.g. de.serlo.org) and one global scope (e.g. serlo.org). In the future we might add more granular scopes
 * (e.g. subject "Mathematik" in de.serlo.org) or other global scopes (e.g. some-fancy-new-product.serlo.org).
 *
 * The scope name represents its inheritance path, split by a colon (e.g. "serlo.org:de:math:foobar"). This allows us
 * to optimize fetching the authorization payload later (e.g. frontend might only request the permissions for de.serlo.org).
 */
import { either as E } from 'fp-ts'

import { Model } from '~/internals/graphql'
import {
  DiscriminatorType,
  EntityRevisionTypeDecoder,
  EntityTypeDecoder,
} from '~/model/decoder'
import { Instance } from '~/types'

export enum Scope {
  Serlo = 'serlo.org',
  Serlo_De = 'serlo.org:de',
  Serlo_En = 'serlo.org:en',
  Serlo_Es = 'serlo.org:es',
  Serlo_Fr = 'serlo.org:fr',
  Serlo_Hi = 'serlo.org:hi',
  Serlo_Ta = 'serlo.org:ta',
}

export function instanceToScope(instance: Instance | null): Scope {
  return instance === null ? Scope.Serlo : (`serlo.org:${instance}` as Scope)
}

/**
 * Permissions are unique strings that implicitly have a special semantic. While legacy system had a distinction between
 * "global" permissions and "instanced" permissions, our API implementation does not make that distinction. Any permission
 * may be granted in any scope.
 */
export enum Permission {
  Thread_CreateThread = 'thread:createThread',
  Thread_CreateComment = 'thread:createComment',
  Thread_SetThreadArchived = 'thread:setThreadArchived',
  Thread_SetThreadState = 'thread:setThreadState',
  Thread_SetCommentState = 'thread:setCommentState',
  Uuid_SetState_Entity = 'uuid:setState:Entity',
  Uuid_SetState_EntityRevision = 'uuid:setState:EntityRevision',
  Uuid_SetState_Page = 'uuid:setState:Page',
  Uuid_SetState_PageRevision = 'uuid:setState:PageRevision',
  Uuid_SetState_TaxonomyTerm = 'uuid:setState:TaxonomyTerm',
}

/**
 * The AuthorizationPayload is the opaque data structure that clients (e.g. frontend) use with our authorization API
 * (i.e. \@serlo/authorization package) to check if users is allowed to do something. For now, it is an object representing
 * the granted permissions in each scope (while also including the granted permissions of parent scopes). We can optimize
 * that payload later if needed.
 */
export type AuthorizationPayload = {
  [scope in Scope]?: Permission[]
}

/** An `AuthorizationGuard` expects an `AuthorizationPayload`. It returns true if the user may do the action associated with the guard. */
export type AuthorizationGuard = (
  authorizationPayload: AuthorizationPayload
) => boolean

/**
 * A `GenericAuthorizationGuard` expects the current `Scope` and returns an `AuthorizationGuard`.
 */
export type GenericAuthorizationGuard = (scope: Scope) => AuthorizationGuard

/**
 * Creates an authorization guard that checks whether the user has the given permission in the given scope.
 *
 * @param permission The permission to check
 * @returns An `AuthorizationGuard`
 */
function createPermissionGuard(
  permission: Permission
): GenericAuthorizationGuard {
  return (scope) => (authorizationPayload) => {
    return authorizationPayload[scope]?.includes(permission) === true
  }
}

/**
 * This is the public API supposed to be used by clients. The structure follows our GraphQL mutations as close as possible.
 */
export const Thread = {
  createThread: createPermissionGuard(Permission.Thread_CreateThread),
  createComment: createPermissionGuard(Permission.Thread_CreateComment),
  setThreadArchived: createPermissionGuard(Permission.Thread_SetThreadArchived),
  setThreadState: createPermissionGuard(Permission.Thread_SetThreadState),
  setCommentState: createPermissionGuard(Permission.Thread_SetCommentState),
}

export const Uuid = {
  setUuid: ({
    __typename,
  }: Pick<Model<'AbstractUuid'>, '__typename'>): GenericAuthorizationGuard => {
    return (scope) => (authorizationPayload) => {
      switch (__typename) {
        case DiscriminatorType.Comment:
          return false
        case DiscriminatorType.Page:
          return checkPermission(Permission.Uuid_SetState_Page)
        case DiscriminatorType.PageRevision:
          return checkPermission(Permission.Uuid_SetState_PageRevision)
        case DiscriminatorType.TaxonomyTerm:
          return checkPermission(Permission.Uuid_SetState_TaxonomyTerm)
        case DiscriminatorType.User:
          return false
        default:
          if (E.isRight(EntityTypeDecoder.decode(__typename))) {
            return checkPermission(Permission.Uuid_SetState_Entity)
          }
          if (E.isRight(EntityRevisionTypeDecoder.decode(__typename))) {
            return checkPermission(Permission.Uuid_SetState_Entity)
          }
          return false
      }

      function checkPermission(permission: Permission) {
        return createPermissionGuard(permission)(scope)(authorizationPayload)
      }
    }
  },
}
