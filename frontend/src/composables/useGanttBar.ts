import { ref } from 'vue'

export type GanttBarDateType = 'both' | 'startOnly' | 'endOnly'

export interface GanttBarModel {
	id: string
	start: Date
	end: Date
	meta?: {
		label?: string
		color?: string
		hasActualDates?: boolean
		dateType?: GanttBarDateType
		isDone?: boolean
		task?: unknown
		isParent?: boolean
		hasDerivedDates?: boolean
		indentLevel?: number
	}
}
export interface UseGanttBarOptions {
	model: GanttBarModel
	timelineStart: Date
	timelineEnd: Date
	onUpdate?: (id: string, newStart: Date, newEnd: Date) => void
	keyboardStepDays?: number
	applySteps?: (date: Date, steps: number) => Date
}

export function useGanttBar(options: UseGanttBarOptions) {
	const dragging = ref(false)
	const selected = ref(false)
	const focused = ref(false)

	function onFocus() {
		focused.value = true
	}

	function onBlur() {
		focused.value = false
	}

	function applyStep(date: Date, steps: number): Date {
		if (options.applySteps) {
			return options.applySteps(date, steps)
		}
		// Fallback: treat steps as days
		const d = new Date(date)
		d.setDate(d.getDate() + steps)
		return d
	}

	function changeSize(direction: 'left' | 'right', modifier: -1 | 1) {
		const step = options.keyboardStepDays ?? 1
		const newStart = new Date(options.model.start)
		const newEnd = new Date(options.model.end)

		let updatedStart: Date
		let updatedEnd: Date

		if (direction === 'left') {
			// Shift+Left: Expand task to the left (move start date earlier)
			updatedStart = applyStep(newStart, -step * modifier)
			updatedEnd = newEnd
		} else {
			// Shift+Right: Expand task to the right (move end date later)  
			updatedStart = newStart
			updatedEnd = applyStep(newEnd, step * modifier)
		}

		// Validate that start is before end (maintain minimum duration)
		if (updatedStart < updatedEnd) {
			options.model.start = updatedStart
			options.model.end = updatedEnd

			if (options.onUpdate) {
				options.onUpdate(options.model.id, updatedStart, updatedEnd)
			}
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		// task expanding
		if (e.shiftKey) {
			if (e.code === 'ArrowLeft') {
				e.preventDefault()
				changeSize('left', 1)
			}
			if (e.code === 'ArrowRight') {
				e.preventDefault()
				changeSize('right', 1)
			}
		}
		// task shrinking
		else if (e.ctrlKey) {
			if (e.code === 'ArrowLeft') {
				e.preventDefault()
				changeSize('left', -1)
			}
			if (e.code === 'ArrowRight') {
				e.preventDefault()
				changeSize('right', -1)
			}
		}
		// task movement
		else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
			e.preventDefault()

			const step = options.keyboardStepDays ?? 1
			const dir = e.code === 'ArrowRight' ? step : -step
			const newStart = applyStep(options.model.start, dir)
			const newEnd = applyStep(options.model.end, dir)

			options.model.start = newStart
			options.model.end = newEnd

			if (options.onUpdate) {
				options.onUpdate(options.model.id, newStart, newEnd)
			}
		}
	}

	return {
		dragging,
		selected,
		focused,
		onFocus,
		onBlur,
		onKeyDown,
	}
}
