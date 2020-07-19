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
import { Schema } from '../utils'
import {
  EntityPayload,
  EntityType,
  EntityRevision,
  EntityRevisionPayload,
  EntityRevisionType,
} from './abstract-entity'
import {
  addTaxonomyTermChildResolvers,
  TaxonomyTermChild,
} from './abstract-taxonomy-term-child'

export const articleSchema = new Schema()

export class Article extends TaxonomyTermChild {
  public __typename = EntityType.Article
}
export interface ArticlePayload extends EntityPayload {
  taxonomyTermIds: number[]
}

export class ArticleRevision extends EntityRevision {
  public __typename = EntityRevisionType.ArticleRevision
  public title: string
  public content: string
  public changes: string
  public metaTitle: string
  public metaDescription: string

  public constructor(payload: ArticleRevisionPayload) {
    super(payload)
    this.title = payload.title
    this.content = payload.content
    this.changes = payload.changes
    this.metaTitle = payload.metaTitle
    this.metaDescription = payload.metaDescription
  }
}

export interface ArticleRevisionPayload extends EntityRevisionPayload {
  title: string
  content: string
  changes: string
  metaTitle: string
  metaDescription: string
}

addTaxonomyTermChildResolvers({
  schema: articleSchema,
  entityType: EntityType.Article,
  entityRevisionType: EntityRevisionType.ArticleRevision,
  repository: 'article',
  Entity: Article,
  EntityRevision: ArticleRevision,
  entityFields: `
    taxonomyTerms: [TaxonomyTerm!]!
  `,
  entityPayloadFields: `
    taxonomyTermIds: [Int!]!
  `,
  entityRevisionFields: `
    title: String!
    content: String!
    changes: String!
    metaTitle: String!
    metaDescription: String!
  `,
})
