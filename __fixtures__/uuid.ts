import { Instance } from '../src/graphql/schema/instance'
import {
  AliasPayload,
  ArticlePayload,
  ArticleRevisionPayload,
  ExercisePayload,
  ExerciseRevisionPayload,
  PagePayload,
  PageRevisionPayload,
  TaxonomyTermPayload,
  TaxonomyTermType,
  UserPayload,
} from '../src/graphql/schema/uuid'
import { license } from './license'
import {
  SolutionPayload,
  SolutionRevisionPayload,
} from '../src/graphql/schema/uuid/solution'

export const article: ArticlePayload = {
  id: 1855,
  trashed: false,
  instance: Instance.De,
  alias: '/mathe/funktionen/uebersicht-aller-artikel-zu-funktionen/parabel',
  date: '2014-03-01T20:45:56Z',
  currentRevisionId: 30674,
  licenseId: license.id,
  taxonomyTermIds: [5],
}

export const articleAlias: AliasPayload = {
  id: 1855,
  instance: Instance.De,
  path: '/mathe/funktionen/uebersicht-aller-artikel-zu-funktionen/parabel',
  source: '/entity/view/1855',
  timestamp: '2014-06-16T15:58:45Z',
}

export const articleRevision: ArticleRevisionPayload = {
  id: 30674,
  trashed: false,
  date: '2014-09-15T15:28:35Z',
  authorId: 1,
  repositoryId: article.id,
  title: 'title',
  content: 'content',
  changes: 'changes',
}

export const pageAlias: AliasPayload = {
  id: 19767,
  instance: Instance.De,
  path: '/mathe',
  source: '/page/view/19767',
  timestamp: '2014-05-25T10:25:44Z',
}

export const page: PagePayload = {
  id: 19767,
  trashed: false,
  instance: Instance.De,
  alias: '/mathe',
  currentRevisionId: 35476,
  licenseId: license.id,
}

export const pageRevision: PageRevisionPayload = {
  id: 35476,
  trashed: false,
  title: 'title',
  content: 'content',
  date: '2015-02-28T02:06:40Z',
  authorId: 1,
  repositoryId: page.id,
}

export const exerciseAlias: AliasPayload = {
  id: 29637,
  instance: Instance.De,
  path: '/29637/29637',
  source: '/entity/view/29637',
  timestamp: '2014-05-25T10:25:44Z',
}

export const exercise: ExercisePayload = {
  id: 29637,
  trashed: false,
  instance: Instance.De,
  alias: '/29637/29637',
  date: '2014-03-01T20:45:56Z',
  currentRevisionId: 29638,
  licenseId: license.id,
  solutionId: 29648,
  taxonomyTermIds: [5],
}

export const exerciseRevision: ExerciseRevisionPayload = {
  id: 29638,
  trashed: false,
  date: '2014-09-15T15:28:35Z',
  authorId: 1,
  repositoryId: exercise.id,
  content: 'content',
  changes: 'changes',
}

export const solutionAlias: AliasPayload = {
  id: 29648,
  instance: Instance.De,
  path: '/29648/29648',
  source: '/entity/view/29648',
  timestamp: '2014-05-25T10:25:44Z',
}

export const solution: SolutionPayload = {
  id: 29648,
  trashed: false,
  instance: Instance.De,
  alias: '/29648/29648',
  date: '2014-03-01T20:45:56Z',
  currentRevisionId: 29652,
  licenseId: license.id,
  parentId: exercise.id,
}

export const solutionRevision: SolutionRevisionPayload = {
  id: 29652,
  trashed: false,
  date: '2014-09-15T15:28:35Z',
  authorId: 1,
  repositoryId: solution.id,
  content: 'content',
  changes: 'changes',
}

export const taxonomyTermRoot: TaxonomyTermPayload = {
  id: 3,
  trashed: false,
  alias: null,
  type: TaxonomyTermType.Root,
  instance: Instance.De,
  name: 'name',
  description: null,
  weight: 1,
  parentId: null,
  childrenIds: [5],
}

export const taxonomyTermSubject: TaxonomyTermPayload = {
  id: 5,
  trashed: false,
  alias: 'alias',
  type: TaxonomyTermType.Subject,
  instance: Instance.De,
  name: 'name',
  description: null,
  weight: 2,
  parentId: taxonomyTermRoot.id,
  childrenIds: [16048],
}

export const taxonomyTermCurriculumTopic: TaxonomyTermPayload = {
  id: 16048,
  trashed: false,
  alias: 'alias',
  type: TaxonomyTermType.CurriculumTopic,
  instance: Instance.De,
  name: 'name',
  description: 'description',
  weight: 3,
  parentId: taxonomyTermSubject.id,
  childrenIds: [1855],
}

export const user: UserPayload = {
  id: 1,
  trashed: false,
  username: 'username',
  date: '2014-03-01T20:36:21Z',
  lastLogin: '2020-03-24T09:40:55Z',
  description: null,
}
