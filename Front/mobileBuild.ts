interface MobileConfig {
    server?: { url?: string; cleartext?: boolean };
    android?: { allowMixedContent?: boolean };
}

export function createMobileBuildMetadata(config: MobileConfig) {
    if (config.server?.url || config.server?.cleartext || config.android?.allowMixedContent) {
        throw new Error('The offline APK cannot use a preview server or mixed network content');
    }
    return { dataSource: 'embedded-python', offline: true, firstYear: 1900, lastYear: 2050 } as const;
}
