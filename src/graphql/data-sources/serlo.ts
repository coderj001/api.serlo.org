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
import { RESTDataSource } from 'apollo-datasource-rest'
import jwt from 'jsonwebtoken'

import { Environment } from '../environment'
import { Instance } from '../schema/instance'
import { License } from '../schema/license'
import { Service } from '../schema/types'
import {
  AliasPayload,
  ArticlePayload,
  ArticleRevisionPayload,
  ExercisePayload,
  ExerciseRevisionPayload,
  ExerciseGroupPayload,
  ExerciseGroupRevisionPayload,
  GroupedExercisePayload,
  GroupedExerciseRevisionPayload,
  SolutionPayload,
  SolutionRevisionPayload,
  PagePayload,
  PageRevisionPayload,
  TaxonomyTermPayload,
  UserPayload,
  AppletPayload,
  AppletRevisionPayload,
  EventPayload,
  EventRevisionPayload,
  VideoPayload,
  VideoRevisionPayload,
  CoursePayload,
  CourseRevisionPayload,
  CoursePagePayload,
  CoursePageRevisionPayload,
} from '../schema/uuid'

export class SerloDataSource extends RESTDataSource {
  public constructor(private environment: Environment) {
    super()
  }

  public async getAlias({
    path,
    instance,
    bypassCache = false,
  }: {
    path: string
    instance: Instance
    bypassCache?: boolean
  }) {
    return this.cacheAwareGet({
      path: `/api/alias${path}`,
      instance,
      bypassCache,
    })
  }

  public async setAlias(alias: AliasPayload) {
    const cacheKey = this.getCacheKey(`/api/alias${alias.path}`, alias.instance)
    await this.environment.cache.set(cacheKey, JSON.stringify(alias))
  }

  public async getLicense({
    id,
    bypassCache = false,
  }: {
    id: number
    bypassCache?: boolean
  }) {
    return this.cacheAwareGet({ path: `/api/license/${id}`, bypassCache })
  }

  public async setLicense(license: License) {
    const cacheKey = this.getCacheKey(`/api/license/${license.id}`)
    await this.environment.cache.set(cacheKey, JSON.stringify(license))
  }

  public async removeLicense({ id }: { id: number }) {
    const cacheKey = this.getCacheKey(`/api/license/${id}`)
    await this.environment.cache.set(cacheKey, JSON.stringify(null))
  }

  public async getUuid({
    id,
    bypassCache = false,
  }: {
    id: number
    bypassCache?: boolean
  }) {
    return this.cacheAwareGet({ path: `/api/uuid/${id}`, bypassCache })
  }

  public async removeUuid({ id }: { id: number }) {
    const cacheKey = this.getCacheKey(`/api/uuid/${id}`)
    await this.environment.cache.set(cacheKey, JSON.stringify(null))
  }

  public async setApplet(applet: AppletPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${applet.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...applet, discriminator: 'entity', type: 'applet' })
    )
  }

  public async setAppletRevision(appletRevision: AppletRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${appletRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...appletRevision,
        discriminator: 'entityRevision',
        type: 'applet',
      })
    )
  }

  public async setArticle(article: ArticlePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${article.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...article, discriminator: 'entity', type: 'article' })
    )
  }

  public async setArticleRevision(articleRevision: ArticleRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${articleRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...articleRevision,
        discriminator: 'entityRevision',
        type: 'article',
      })
    )
  }

  public async setCourse(course: CoursePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${course.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...course, discriminator: 'entity', type: 'course' })
    )
  }

  public async setCourseRevision(courseRevision: CourseRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${courseRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...courseRevision,
        discriminator: 'entityRevision',
        type: 'course',
      })
    )
  }

  public async setCoursePage(coursePage: CoursePagePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${coursePage.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...coursePage,
        discriminator: 'entity',
        type: 'coursePage',
      })
    )
  }

  public async setCoursePageRevision(
    coursePageRevision: CoursePageRevisionPayload
  ) {
    const cacheKey = this.getCacheKey(`/api/uuid/${coursePageRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...coursePageRevision,
        discriminator: 'entityRevision',
        type: 'coursePage',
      })
    )
  }

  public async setEvent(event: EventPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${event.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...event, discriminator: 'entity', type: 'event' })
    )
  }

  public async setEventRevision(eventRevision: EventRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${eventRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...eventRevision,
        discriminator: 'entityRevision',
        type: 'event',
      })
    )
  }

  public async setExercise(exercise: ExercisePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${exercise.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...exercise, discriminator: 'entity', type: 'exercise' })
    )
  }

  public async setExerciseRevision(exerciseRevision: ExerciseRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${exerciseRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...exerciseRevision,
        discriminator: 'entityRevision',
        type: 'exercise',
      })
    )
  }

  public async setExerciseGroup(exerciseGroup: ExerciseGroupPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${exerciseGroup.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...exerciseGroup,
        discriminator: 'entity',
        type: 'exerciseGroup',
      })
    )
  }

  public async setExerciseGroupRevision(
    exerciseGroupRevision: ExerciseGroupRevisionPayload
  ) {
    const cacheKey = this.getCacheKey(`/api/uuid/${exerciseGroupRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...exerciseGroupRevision,
        discriminator: 'entityRevision',
        type: 'exerciseGroup',
      })
    )
  }

  public async setGroupedExercise(groupedExercise: GroupedExercisePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${groupedExercise.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...groupedExercise,
        discriminator: 'entity',
        type: 'groupedExercise',
      })
    )
  }

  public async setGroupedExerciseRevision(
    groupedExerciseRevision: GroupedExerciseRevisionPayload
  ) {
    const cacheKey = this.getCacheKey(`/api/uuid/${groupedExerciseRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...groupedExerciseRevision,
        discriminator: 'entityRevision',
        type: 'groupedExercise',
      })
    )
  }

  public async setPage(page: PagePayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${page.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...page, discriminator: 'page' })
    )
  }

  public async setPageRevision(pageRevision: PageRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${pageRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...pageRevision, discriminator: 'pageRevision' })
    )
  }

  public async setSolution(solution: SolutionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${solution.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...solution, discriminator: 'entity', type: 'solution' })
    )
  }

  public async setSolutionRevision(solutionRevision: SolutionRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${solutionRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...solutionRevision,
        discriminator: 'entityRevision',
        type: 'solution',
      })
    )
  }

  public async setTaxonomyTerm(taxonomyTerm: TaxonomyTermPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${taxonomyTerm.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...taxonomyTerm, discriminator: 'taxonomyTerm' })
    )
  }

  public async setUser(user: UserPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${user.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...user, discriminator: 'user' })
    )
  }

  public async setVideo(video: VideoPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${video.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({ ...video, discriminator: 'entity', type: 'video' })
    )
  }

  public async setVideoRevision(videoRevision: VideoRevisionPayload) {
    const cacheKey = this.getCacheKey(`/api/uuid/${videoRevision.id}`)
    await this.environment.cache.set(
      cacheKey,
      JSON.stringify({
        ...videoRevision,
        discriminator: 'entityRevision',
        type: 'video',
      })
    )
  }

  private async cacheAwareGet({
    path,
    instance = Instance.De,
    bypassCache = false,
  }: {
    path: string
    instance?: Instance
    bypassCache?: boolean
  }) {
    const cacheKey = this.getCacheKey(path, instance)
    if (!bypassCache) {
      const cache = await this.environment.cache.get(cacheKey)
      if (cache) return JSON.parse(cache)
    }

    const token = jwt.sign({}, process.env.SERLO_ORG_SECRET!, {
      expiresIn: '2h',
      audience: Service.Serlo,
      issuer: 'api.serlo.org',
    })

    const data = await (process.env.NODE_ENV === 'test'
      ? super.get(`http://localhost:9009${path}`)
      : super.get(
          `http://${instance}.${process.env.SERLO_ORG_HOST}${path}`,
          {},
          {
            headers: {
              Authorization: `Serlo Service=${token}`,
            },
          }
        ))

    await this.environment.cache.set(cacheKey, JSON.stringify(data))
    return data
  }

  private getCacheKey(path: string, instance: Instance = Instance.De) {
    return `${instance}.serlo.org${path}`
  }
}
