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
import { gql } from 'apollo-server'

import {
  navigation,
  page as subjectHomepage,
  taxonomyTermCurriculumTopic,
  taxonomyTermRoot,
  taxonomyTermSubject,
} from '../../../__fixtures__'
import { castToAlias, Client, nextUuid } from '../../__utils__'
import { Service } from '~/internals/authentication'
import { Model } from '~/internals/graphql'
import { Payload } from '~/internals/model'
import { Instance } from '~/types'

let client: Client

beforeEach(() => {
  client = new Client({ service: Service.Serlo })
})

describe('Page', () => {
  test('Without navigation', async () => {
    await createSetPageMutation(subjectHomepage).execute()
    await createSetNavigationMutation({
      instance: Instance.De,
      data: [],
    }).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on Page {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: subjectHomepage.id })
      .shouldReturnData({ uuid: { navigation: null } })
  })

  test('Subject Homepage', async () => {
    await createSetPageMutation(subjectHomepage).execute()
    await createSetNavigationMutation(navigation).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on Page {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: subjectHomepage.id })
      .shouldReturnData({
        uuid: {
          navigation: {
            path: {
              nodes: [
                {
                  label: 'Mathematik',
                  url: subjectHomepage.alias,
                  id: subjectHomepage.id,
                },
              ],
              totalCount: 1,
            },
          },
        },
      })
  })

  test('Dropdown', async () => {
    const page = {
      ...subjectHomepage,
      id: nextUuid(subjectHomepage.id),
      alias: castToAlias('/page'),
    }

    await createSetPageMutation(subjectHomepage).execute()
    await createSetPageMutation(page).execute()
    await createSetNavigationMutation({
      instance: Instance.De,
      data: [
        {
          label: 'Mathematik',
          id: subjectHomepage.id,
          children: [
            {
              label: 'Dropdown',
              children: [
                {
                  label: 'Page',
                  id: page.id,
                },
              ],
            },
          ],
        },
      ],
    }).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on Page {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: page.id })
      .shouldReturnData({
        uuid: {
          navigation: {
            path: {
              nodes: [
                {
                  label: 'Mathematik',
                  url: subjectHomepage.alias,
                  id: subjectHomepage.id,
                },
                {
                  label: 'Dropdown',
                  url: null,
                  id: null,
                },
                {
                  label: 'Page',
                  url: page.alias,
                  id: page.id,
                },
              ],
              totalCount: 3,
            },
          },
        },
      })
  })
})

describe('Taxonomy Term', () => {
  test('Without navigation', async () => {
    await createSetTaxonomyTermMutation(taxonomyTermRoot).execute()
    await createSetTaxonomyTermMutation(taxonomyTermSubject).execute()

    await createSetNavigationMutation({
      instance: Instance.De,
      data: [],
    }).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on TaxonomyTerm {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: taxonomyTermSubject.id })
      .shouldReturnData({ uuid: { navigation: null } })
  })

  test('Subject', async () => {
    await createSetPageMutation(subjectHomepage).execute()
    await createSetTaxonomyTermMutation(taxonomyTermRoot).execute()
    await createSetTaxonomyTermMutation(taxonomyTermSubject).execute()
    await createSetNavigationMutation(navigation).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on TaxonomyTerm {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: taxonomyTermSubject.id })
      .shouldReturnData({
        uuid: {
          navigation: {
            path: {
              nodes: [
                {
                  label: 'Mathematik',
                  url: subjectHomepage.alias,
                  id: subjectHomepage.id,
                },
                {
                  label: 'Alle Themen',
                  url: taxonomyTermSubject.alias,
                  id: taxonomyTermSubject.id,
                },
              ],
              totalCount: 2,
            },
          },
        },
      })
  })

  test('Curriculum Topic', async () => {
    await createSetPageMutation(subjectHomepage).execute()
    await createSetTaxonomyTermMutation(taxonomyTermRoot).execute()
    await createSetTaxonomyTermMutation(taxonomyTermSubject).execute()
    await createSetTaxonomyTermMutation(taxonomyTermCurriculumTopic).execute()
    await createSetNavigationMutation(navigation).execute()

    await client
      .prepareQuery({
        query: gql`
          query uuid($id: Int!) {
            uuid(id: $id) {
              ... on TaxonomyTerm {
                navigation {
                  path {
                    nodes {
                      label
                      url
                      id
                    }
                    totalCount
                  }
                }
              }
            }
          }
        `,
      })
      .withVariables({ id: taxonomyTermCurriculumTopic.id })
      .shouldReturnData({
        uuid: {
          navigation: {
            path: {
              nodes: [
                {
                  label: 'Mathematik',
                  url: subjectHomepage.alias,
                  id: subjectHomepage.id,
                },
                {
                  label: 'Alle Themen',
                  url: taxonomyTermSubject.alias,
                  id: taxonomyTermSubject.id,
                },
                {
                  label: taxonomyTermCurriculumTopic.name,
                  url: taxonomyTermCurriculumTopic.alias,
                  id: taxonomyTermCurriculumTopic.id,
                },
              ],
              totalCount: 3,
            },
          },
        },
      })
  })
})

function createSetNavigationMutation(
  navigation: Payload<'serlo', 'getNavigationPayload'>
) {
  return client
    .prepareQuery({
      query: gql`
        mutation setCache($input: CacheSetInput!) {
          _cache {
            set(input: $input) {
              success
            }
          }
        }
      `,
    })
    .withInput({
      key: `${navigation.instance}.serlo.org/api/navigation`,
      value: navigation,
    })
}

function createSetPageMutation(page: Model<'Page'>) {
  return client
    .prepareQuery({
      query: gql`
        mutation setCache($input: CacheSetInput!) {
          _cache {
            set(input: $input) {
              success
            }
          }
        }
      `,
    })
    .withInput({
      key: `de.serlo.org/api/uuid/${page.id}`,
      value: page,
    })
}

function createSetTaxonomyTermMutation(taxonomyTerm: Model<'TaxonomyTerm'>) {
  return client
    .prepareQuery({
      query: gql`
        mutation setCache($input: CacheSetInput!) {
          _cache {
            set(input: $input) {
              success
            }
          }
        }
      `,
    })
    .withInput({
      key: `de.serlo.org/api/uuid/${taxonomyTerm.id}`,
      value: taxonomyTerm,
    })
}
