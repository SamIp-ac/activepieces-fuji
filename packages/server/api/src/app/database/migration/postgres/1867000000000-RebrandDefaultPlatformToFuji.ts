import { QueryRunner } from 'typeorm'
import { Migration } from '../../migration'

export class RebrandDefaultPlatformToFuji1867000000000 implements Migration {
    name = 'RebrandDefaultPlatformToFuji1867000000000'
    breaking = false
    release = '0.93.0'
    transaction = true

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "platform"
            SET "name" = 'Fuji'
            WHERE "name" = 'Activepieces'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "logoIconUrl" = '/logo.svg'
            WHERE "logoIconUrl" = 'https://cdn.activepieces.com/brand/logo.svg'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "fullLogoUrl" = '/logo-full.svg'
            WHERE "fullLogoUrl" = 'https://cdn.activepieces.com/brand/full-logo.png'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "favIconUrl" = '/logo.svg'
            WHERE "favIconUrl" = 'https://cdn.activepieces.com/brand/logo.svg'
        `)
        await queryRunner.query(`
            UPDATE "flag"
            SET "value" = jsonb_set(jsonb_set(jsonb_set(jsonb_set(
                "value",
                '{websiteName}', '"Fuji"'),
                '{logos,fullLogoUrl}', '"/logo-full.svg"'),
                '{logos,favIconUrl}', '"/logo.svg"'),
                '{logos,logoIconUrl}', '"/logo.svg"')
            WHERE "id" = 'THEME' AND "value" ->> 'websiteName' = 'Activepieces'
        `)
        await queryRunner.query(`
            UPDATE "ai_provider"
            SET "displayName" = 'Fuji'
            WHERE "provider" = 'activepieces' AND "displayName" = 'Activepieces'
        `)
        await queryRunner.query(`
            UPDATE "platform_configuration"
            SET "isProductTelemetryEnabled" = false
            WHERE "isProductTelemetryEnabled" = true
        `)
        await queryRunner.query(`
            UPDATE "template"
            SET "author" = 'Fuji Team'
            WHERE "author" = 'Activepieces Team'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "platform"
            SET "name" = 'Activepieces'
            WHERE "name" = 'Fuji'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "logoIconUrl" = 'https://cdn.activepieces.com/brand/logo.svg'
            WHERE "logoIconUrl" = '/logo.svg'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "fullLogoUrl" = 'https://cdn.activepieces.com/brand/full-logo.png'
            WHERE "fullLogoUrl" = '/logo-full.svg'
        `)
        await queryRunner.query(`
            UPDATE "platform"
            SET "favIconUrl" = 'https://cdn.activepieces.com/brand/logo.svg'
            WHERE "favIconUrl" = '/logo.svg'
        `)
        await queryRunner.query(`
            UPDATE "flag"
            SET "value" = jsonb_set(jsonb_set(jsonb_set(jsonb_set(
                "value",
                '{websiteName}', '"Activepieces"'),
                '{logos,fullLogoUrl}', '"https://cdn.activepieces.com/brand/full-logo.png"'),
                '{logos,favIconUrl}', '"https://cdn.activepieces.com/brand/logo.svg"'),
                '{logos,logoIconUrl}', '"https://cdn.activepieces.com/brand/logo.svg"')
            WHERE "id" = 'THEME' AND "value" ->> 'websiteName' = 'Fuji'
        `)
        await queryRunner.query(`
            UPDATE "ai_provider"
            SET "displayName" = 'Activepieces'
            WHERE "provider" = 'activepieces' AND "displayName" = 'Fuji'
        `)
        await queryRunner.query(`
            UPDATE "platform_configuration"
            SET "isProductTelemetryEnabled" = true
            WHERE "isProductTelemetryEnabled" = false
        `)
        await queryRunner.query(`
            UPDATE "template"
            SET "author" = 'Activepieces Team'
            WHERE "author" = 'Fuji Team'
        `)
    }
}
