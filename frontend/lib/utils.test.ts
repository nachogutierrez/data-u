// utils.test.ts
import { timeAgo } from './utils';

describe('timeAgo', () => {
    it('should return "just now" for a date just seconds ago', () => {
        const now = new Date();
        const result = timeAgo(now.toISOString());
        expect(result).toBe('just now');
    });

    it('should return "1s ago" for a date 1 second ago', () => {
        const now = new Date();
        const oneSecondAgo = new Date(now.getTime() - 1000).toISOString();
        const result = timeAgo(oneSecondAgo);
        expect(result).toBe('1s ago');
    });

    it('should return "1m ago" for a date 1 minute ago', () => {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();
        const result = timeAgo(oneMinuteAgo);
        expect(result).toBe('1m ago');
    });

    it('should return "1h ago" for a date 1 hour ago', () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();
        const result = timeAgo(oneHourAgo);
        expect(result).toBe('1h ago');
    });

    it('should return "1d ago" for a date 1 day ago', () => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();
        const result = timeAgo(oneDayAgo);
        expect(result).toBe('1d ago');
    });

    it('should return "1mo ago" for a date 1 month ago', () => {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 2592000000).toISOString();
        const result = timeAgo(oneMonthAgo);
        expect(result).toBe('1mo ago');
    });

    it('should return "1y ago" for a date 1 year ago', () => {
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 31536000000).toISOString();
        const result = timeAgo(oneYearAgo);
        expect(result).toBe('1y ago');
    });

    it('should handle different time units correctly', () => {
        const now = new Date();

        const fiveSecondsAgo = new Date(now.getTime() - 5000).toISOString();
        expect(timeAgo(fiveSecondsAgo)).toBe('5s ago');

        const tenMinutesAgo = new Date(now.getTime() - 600000).toISOString();
        expect(timeAgo(tenMinutesAgo)).toBe('10m ago');

        const threeHoursAgo = new Date(now.getTime() - 10800000).toISOString();
        expect(timeAgo(threeHoursAgo)).toBe('3h ago');

        const twoDaysAgo = new Date(now.getTime() - 172800000).toISOString();
        expect(timeAgo(twoDaysAgo)).toBe('2d ago');

        const sixMonthsAgo = new Date(now.getTime() - 15552000000).toISOString();
        expect(timeAgo(sixMonthsAgo)).toBe('6mo ago');

        const threeYearsAgo = new Date(now.getTime() - 94608000000).toISOString();
        expect(timeAgo(threeYearsAgo)).toBe('3y ago');
    });

    it('should handle invalid date inputs gracefully', () => {
        expect(timeAgo('invalid date')).toBe('just now');
        expect(timeAgo(null)).toBe('just now');
        expect(timeAgo(undefined)).toBe('just now');
    });
});
