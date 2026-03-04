<template>
	<div
		class="gantt-timeline"
		role="columnheader"
		:aria-label="$t('project.gantt.timelineHeader')"
	>
		<!-- Day scale: Day row (upper) + Hour row (lower) -->
		<template v-if="scale === 'day'">
			<div
				class="gantt-timeline-upper"
				role="row"
				:aria-label="$t('project.gantt.daysRow')"
			>
				<div
					v-for="group in dayScaleDayGroups"
					:key="group.key"
					class="timeunit-upper"
					:style="{ width: `${group.width}px` }"
					role="columnheader"
					:aria-label="$t('project.gantt.dayLabel', {
						date: group.date.toLocaleDateString(),
						weekday: weekDayFromDate(group.date),
					})"
				>
					{{ group.label }}
				</div>
			</div>
			<div
				class="gantt-timeline-lower"
				role="row"
				:aria-label="$t('project.gantt.hoursRow')"
			>
				<div
					v-for="date in timelineData"
					:key="date.toISOString()"
					class="timeunit"
					:style="{ width: `${unitWidthPixels}px` }"
					role="columnheader"
					:aria-label="hourIsNow(date)
						? $t('project.gantt.hourLabelNow', { hour: formatHour(date) })
						: $t('project.gantt.hourLabel', { hour: formatHour(date) })"
				>
					<div
						class="timeunit-wrapper"
						:class="{'today': hourIsNow(date)}"
					>
						<span class="hour-label">{{ formatHour(date) }}</span>
					</div>
				</div>
			</div>
		</template>

		<!-- Week scale: Month row (upper) + Day row (lower) -->
		<template v-else>
			<div
				class="gantt-timeline-upper"
				role="row"
				:aria-label="$t('project.gantt.monthsRow')"
			>
				<div
					v-for="group in weekScaleMonthGroups"
					:key="group.key"
					class="timeunit-upper"
					:style="{ width: `${group.width}px` }"
					role="columnheader"
					:aria-label="$t('project.gantt.monthLabel', {month: group.label})"
				>
					{{ group.label }}
				</div>
			</div>
			<div
				class="gantt-timeline-lower"
				role="row"
				:aria-label="$t('project.gantt.daysRow')"
			>
				<div
					v-for="date in timelineData"
					:key="date.toISOString()"
					class="timeunit"
					:style="{ width: `${unitWidthPixels}px` }"
					role="columnheader"
					:aria-label="dateIsToday(date)
						? $t('project.gantt.dayLabelToday', {
							date: date.toLocaleDateString(),
							weekday: weekDayFromDate(date),
						})
						: $t('project.gantt.dayLabel', {
							date: date.toLocaleDateString(),
							weekday: weekDayFromDate(date),
						})"
				>
					<div
						class="timeunit-wrapper"
						:class="{'today': dateIsToday(date)}"
					>
						<span>{{ date.getDate() }}</span>
						<span class="weekday">
							{{ weekDayFromDate(date) }}
						</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useGlobalNow} from '@/composables/useGlobalNow'
import {useWeekDayFromDate} from '@/helpers/time/formatDate'
import dayjs from 'dayjs'
import type {GanttScale} from '@/helpers/ganttScaleConfig'

const props = defineProps<{
	timelineData: Date[]
	unitWidthPixels: number
	scale: GanttScale
}>()

const weekDayFromDate = useWeekDayFromDate()
const {now: today} = useGlobalNow()

// ── Helpers ──────────────────────────────────────────────────────────────────

const dateIsToday = computed(() => {
	const todayStr = today.value.toDateString()
	return (date: Date) => date.toDateString() === todayStr
})

const hourIsNow = computed(() => {
	const t = today.value
	return (date: Date) =>
		date.getFullYear() === t.getFullYear()
		&& date.getMonth() === t.getMonth()
		&& date.getDate() === t.getDate()
		&& date.getHours() === t.getHours()
})

function formatHour(date: Date): string {
	return `${date.getHours()}:00`
}

// ── Day scale: group hours by day ────────────────────────────────────────────

const dayScaleDayGroups = computed(() => {
	return props.timelineData.reduce(
		(groups, date) => {
			const key = date.toDateString()

			const lastGroup = groups[groups.length - 1]
			if (lastGroup?.key === key) {
				lastGroup.width += props.unitWidthPixels
			} else {
				groups.push({
					key,
					label: dayjs(date).format('ddd, D MMM YYYY'),
					date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
					width: props.unitWidthPixels,
				})
			}

			return groups
		},
		[] as Array<{key: string; label: string; date: Date; width: number}>,
	)
})

// ── Week scale: group days by month ──────────────────────────────────────────

const weekScaleMonthGroups = computed(() => {
	return props.timelineData.reduce(
		(groups, date) => {
			const month = date.getMonth()
			const year = date.getFullYear()
			const key = `${year}-${month}`

			const lastGroup = groups[groups.length - 1]
			if (lastGroup?.key === key) {
				lastGroup.width += props.unitWidthPixels
			} else {
				groups.push({
					key,
					label: dayjs(date).format('MMMM YYYY'),
					width: props.unitWidthPixels,
				})
			}

			return groups
		},
		[] as Array<{key: string; label: string; width: number}>,
	)
})

</script>

<style scoped lang="scss">
.gantt-timeline {
	background: var(--white);
	border-block-end: 1px solid var(--grey-200);
	position: sticky;
	inset-block-start: 0;
	z-index: 10;
}

.gantt-timeline-upper {
	display: flex;

	.timeunit-upper {
		background: var(--white);
		font-family: $vikunja-font;
		font-weight: bold;
		border-inline-end: 1px solid var(--grey-200);
		padding: 0.5rem 0;
		text-align: center;
		font-size: 1rem;
		color: var(--grey-800);
	}
}

.gantt-timeline-lower {
	display: flex;

	.timeunit {
		.timeunit-wrapper {
			padding: 0.5rem 0;
			font-size: 1rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			inline-size: 100%;
			font-family: $vikunja-font;

			&.today {
				background: var(--primary);
				color: var(--white);
				border-radius: 5px 5px 0 0;
				font-weight: bold;
			}

			.weekday {
				font-size: 0.8rem;
			}

			.hour-label {
				font-size: 0.75rem;
			}
		}
	}
}
</style>
