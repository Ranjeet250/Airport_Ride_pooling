// ─────────────────────────────────────────────
// Unit Tests — LockManager
// ─────────────────────────────────────────────
const LockManager = require('../src/services/lock-manager');

describe('LockManager', () => {

    test('acquire and release a lock', async () => {
        const lock = await LockManager.acquire('test-lock-1', 5000);
        expect(lock).toBeDefined();
        expect(lock.release).toBeInstanceOf(Function);
        await lock.release();
    });

    test('withLock executes the function and returns result', async () => {
        const result = await LockManager.withLock('test-lock-2', async () => {
            return 42;
        });
        expect(result).toBe(42);
    });

    test('withLock releases lock even on error', async () => {
        try {
            await LockManager.withLock('test-lock-3', async () => {
                throw new Error('Intentional test error');
            });
        } catch (e) {
            expect(e.message).toBe('Intentional test error');
        }

        // Lock should be released — acquiring again should not hang
        const result = await LockManager.withLock('test-lock-3', async () => 'ok');
        expect(result).toBe('ok');
    });

    test('locks serialize concurrent access', async () => {
        const order = [];

        const task1 = LockManager.withLock('test-lock-4', async () => {
            await new Promise((r) => setTimeout(r, 100));
            order.push('task1');
        });

        const task2 = LockManager.withLock('test-lock-4', async () => {
            order.push('task2');
        });

        await Promise.all([task1, task2]);
        expect(order).toEqual(['task1', 'task2']); // task1 finishes before task2 starts
    });

    test('different lock keys do not block each other', async () => {
        const order = [];

        const task1 = LockManager.withLock('lock-A', async () => {
            await new Promise((r) => setTimeout(r, 100));
            order.push('A');
        });

        const task2 = LockManager.withLock('lock-B', async () => {
            order.push('B');
        });

        await Promise.all([task1, task2]);
        // B should complete first since it's a different lock and has no delay
        expect(order[0]).toBe('B');
    });
});
