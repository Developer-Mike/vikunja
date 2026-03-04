import dayjs from 'dayjs'
import {MILLISECONDS_A_DAY, MILLISECONDS_A_HOUR} from '@/constants/date'

export type GanttScale = 'day' | 'week'

export interface GanttScaleConfig {
	/** Width of one column unit in pixels */
	unitWidthPixels: number
	/** Generate an array of Date objects marking each column boundary */
	getTimeUnits(dateFrom: Date, dateTo: Date): Date[]
	/** Convert a date to a pixel X offset relative to dateFrom */
	dateToPixels(date: Date, dateFrom: Date): number
	/** Convert a pixel delta to a whole-step count for drag snapping (hours for day scale, days for week/month) */
	pixelsToSteps(pixels: number): number
	/** Apply N drag steps to a date and return the new date (hours for day scale, days for week/month) */
	applySteps(date: Date, steps: number): Date
	/** Snap a date to the appropriate boundary for this scale (hour for day, day for week/month) */
	snapDate(date: Date, isStart?: boolean): Date
	/** Number of steps per keyboard arrow press */
	keyboardSteps: number
}

// ─── Day scale: 1 column = 1 hour ───────────────────────────────────────────

const DAY_UNIT_PX = 40 // pixels per hour

const dayScaleConfig: GanttScaleConfig = {
	unitWidthPixels: DAY_UNIT_PX,

	getTimeUnits(dateFrom: Date, dateTo: Date): Date[] {
		const dates: Date[] = []
		const current = dayjs(dateFrom).startOf('hour').toDate()
		while (current <= dateTo) {
			dates.push(new Date(current))
			current.setTime(current.getTime() + MILLISECONDS_A_HOUR)
		}
		return dates
	},

	dateToPixels(date: Date, dateFrom: Date): number {
		const diffMs = date.getTime() - dateFrom.getTime()
		return (diffMs / MILLISECONDS_A_HOUR) * DAY_UNIT_PX
	},

	pixelsToSteps(pixels: number): number {
		// Snap to whole hours
		return Math.round(pixels / DAY_UNIT_PX)
	},

	applySteps(date: Date, steps: number): Date {
		const d = new Date(date)
		d.setTime(d.getTime() + steps * MILLISECONDS_A_HOUR)
		return d
	},

	snapDate(date: Date): Date {
		// Snap to the start of the hour
		return dayjs(date).startOf('hour').toDate()
	},

	keyboardSteps: 1,
}

// ─── Week scale: 1 column = 1 day ───────────────────────────────────────────

const WEEK_UNIT_PX = 30 // pixels per day

const weekScaleConfig: GanttScaleConfig = {
	unitWidthPixels: WEEK_UNIT_PX,

	getTimeUnits(dateFrom: Date, dateTo: Date): Date[] {
		const dates: Date[] = []
		const current = dayjs(dateFrom).startOf('day').toDate()
		while (current <= dateTo) {
			dates.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}
		return dates
	},

	dateToPixels(date: Date, dateFrom: Date): number {
		const diffMs = date.getTime() - dateFrom.getTime()
		return (diffMs / MILLISECONDS_A_DAY) * WEEK_UNIT_PX
	},

	pixelsToSteps(pixels: number): number {
		// Snap to whole days
		return Math.round(pixels / WEEK_UNIT_PX)
	},

	applySteps(date: Date, steps: number): Date {
		const d = new Date(date)
		d.setDate(d.getDate() + steps)
		return d
	},

	snapDate(date: Date, isStart = false): Date {
		const d = new Date(date)
		if (isStart || d.getHours() < 12) {
			d.setHours(0, 0, 0, 0)
		} else {
			d.setHours(23, 59, 59, 999)
		}
		return d
	},

	keyboardSteps: 1,
}

export const GANTT_SCALE_CONFIGS: Record<GanttScale, GanttScaleConfig> = {
	day: dayScaleConfig,
	week: weekScaleConfig,
}
