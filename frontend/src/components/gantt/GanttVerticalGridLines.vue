<template>
	<div class="gantt-grid-lines">
		<svg
			class="gantt-vertical-lines"
			:width="totalWidth"
			:height="height"
			xmlns="http://www.w3.org/2000/svg"
		>
			<line
				v-for="(date, index) in timelineData"
				:key="date.toISOString()"
				:x1="index * unitWidthPixels"
				:y1="0"
				:x2="index * unitWidthPixels"
				:y2="height"
				stroke="var(--grey-400)"
				stroke-width="0.5"
				opacity="0.6"
			/>
		</svg>
	</div>
</template>

<script setup lang="ts">
import type {GanttScale} from '@/helpers/ganttScaleConfig'

defineProps<{
	timelineData: Date[]
	totalWidth: number
	height: number
	unitWidthPixels: number
	scale: GanttScale
}>()
</script>

<style scoped lang="scss">
.gantt-grid-lines {
	position: absolute;
	inset-inline-start: 0;
	z-index: 1;
	pointer-events: none;
}

.gantt-vertical-lines {
	position: absolute;
	inset: 0;
}
</style>
