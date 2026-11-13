import { ActivepiecesError, ErrorCode, isNil, SeekPage } from '@activepieces/core-utils'
import { ListTemplatesRequestQuery, Template } from '@activepieces/shared'
import { system } from '../helper/system/system'
import { AppSystemProp } from '../helper/system/system-props'

export const communityTemplates = {
    getOrThrow: async (id: string): Promise<Template> => {
        const templatesSourceUrl = getTemplatesSourceUrl()
        if (isNil(templatesSourceUrl)) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    entityType: 'template',
                    entityId: id,
                    message: `Template ${id} not found`,
                },
            })
        }
        const url = `${templatesSourceUrl}/${id}`
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    entityType: 'template',
                    entityId: id,
                    message: `Template ${id} not found`,
                },
            })
        }
        const template = await response.json()
        return template
    },
    getCategories: async (): Promise<string[]> => {
        const templatesSourceUrl = getTemplatesSourceUrl()
        if (isNil(templatesSourceUrl)) {
            return []
        }
        const url = `${templatesSourceUrl}/categories`
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const categories = await response.json()
        return categories
    },
    list: async (request: ListTemplatesRequestQuery): Promise<SeekPage<Template>> => {
        const templatesSourceUrl = getTemplatesSourceUrl()
        if (isNil(templatesSourceUrl)) {
            return {
                next: null,
                previous: null,
                data: [],
            }
        }
        const queryString = convertToQueryString(request)
        const url = `${templatesSourceUrl}?${queryString}`
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const templates = await response.json()
        return templates
    },
}


function getTemplatesSourceUrl(): string | null {
    const url = system.get(AppSystemProp.TEMPLATES_SOURCE_URL)
    return isNil(url) || url === '' ? null : url
}

function convertToQueryString(params: ListTemplatesRequestQuery) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((val) => {
                if (!isNil(val)) {
                    searchParams.append(key, typeof val === 'string' ? val : JSON.stringify(val))
                }
            })
        }
        else if (!isNil(value)) {
            searchParams.set(key, value.toString())
        }
    })

    return searchParams.toString()
}
