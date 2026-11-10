import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileBuildMetadata } from '../../mobileBuild.ts';

test('packaged app declares local calculation and contains no API URL', () => {
    const metadata = createMobileBuildMetadata({ android: { allowMixedContent: false } });
    assert.equal(metadata.offline, true);
    assert.equal(metadata.dataSource, 'embedded-python');
    assert.equal('apiBaseUrl' in metadata, false);
});
test('offline builds reject preview servers and mixed network content', () => {
    assert.throws(() => createMobileBuildMetadata({ server: { url: 'https://preview.example' } }), /offline APK/);
    assert.throws(() => createMobileBuildMetadata({ server: { cleartext: true } }), /offline APK/);
    assert.throws(() => createMobileBuildMetadata({ android: { allowMixedContent: true } }), /offline APK/);
});
