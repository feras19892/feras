<script setup lang="ts">
import { useDCLab } from '../shared/useDCLab'
import DCPalette from './DCPalette.vue'
import DCTopBar from './DCTopBar.vue'
import DCBottomBar from './DCBottomBar.vue'
import DCReadingsPanel from './DCReadingsPanel.vue'
import DCDialogs from './DCDialogs.vue'
import WorkshopReportToolbar from '../shared/WorkshopReportToolbar.vue'

const {
  workshop, t, canvasRef, onMouseDown, onMouseMove, onMouseUp, onWheel, onDblClick,
  onTouchStart, onTouchMove, onTouchEnd, showValueEditor, editingComp, editValue, editRotation,
  showWireEditor, editingWire, editWireColor, editWireThickness, renderMode, showNodeNumbers,
  showReadings, showResistorTutorial, showHelp, selectedFault, showCalcExplanation, calcExplanationHtml,
  canvasSnapshot, canvasFullscreen, showExperiments, currentExperiment, elapsedSeconds, energyKWh,
  hasDanger, hasWarning, selectedCompFault, redraw, applyEditValue, applyRotate, zoomComp, zoomCompVal,
  deleteSelectedComp, deleteSelectedWire, onAddComponent, loadExp, explainCalcs, exportPNG,
  openCanvasFullscreen, printCircuit, doLoadCircuit, showSaveDialog, showLoadDialog, circuitName,
  savedCircuits, doSaveCircuit, openLoadDialog, doDeleteCircuit, toggleRun, showMNAExplanation, doExportSVG,
  resistorBandPreview, resistorBandExplanation, resistorColorChart,
} = useDCLab()
</script>

<template>
  <div class="dc-lab">
    <!-- Left: Component Palette -->
    <DCPalette
      :t="t"
      :workshop="workshop"
      :on-add-component="onAddComponent"
    />

    <!-- Center: Canvas -->
    <div class="dc-canvas-wrap">
      <canvas
        ref="canvasRef"
        class="dc-canvas"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @wheel.prevent="onWheel"
        @dblclick="onDblClick"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      ></canvas>

      <DCTopBar
        :t="t"
        :workshop="workshop"
        :show-value-editor="showValueEditor"
        :editing-comp="editingComp"
        :edit-value="editValue"
        :edit-rotation="editRotation"
        :show-wire-editor="showWireEditor"
        :editing-wire="editingWire"
        :edit-wire-color="editWireColor"
        :edit-wire-thickness="editWireThickness"
        :render-mode="renderMode"
        :show-node-numbers="showNodeNumbers"
        :show-readings="showReadings"
        :redraw="redraw"
        @update:edit-value="editValue = $event"
        @update:edit-rotation="editRotation = $event"
        @update:edit-wire-color="editWireColor = $event"
        @update:edit-wire-thickness="editWireThickness = $event"
        @update:render-mode="renderMode = $event; redraw()"
        @apply-edit-value="applyEditValue"
        @apply-rotate="applyRotate"
        @zoom-comp="zoomComp"
        @zoom-comp-val="zoomCompVal"
        @show-resistor-tutorial="showResistorTutorial = true"
        @delete-selected-comp="deleteSelectedComp"
        @delete-selected-wire="deleteSelectedWire"
        @open-canvas-fullscreen="openCanvasFullscreen"
        @toggle-node-numbers="showNodeNumbers = !showNodeNumbers; redraw()"
        @toggle-readings="showReadings = !showReadings; redraw()"
        @export-s-v-g="doExportSVG"
      />

      <DCBottomBar
        :t="t"
        :workshop="workshop"
        :show-experiments="showExperiments"
        :current-experiment="currentExperiment"
        :elapsed-seconds="elapsedSeconds"
        :energy-k-wh="energyKWh"
        :has-danger="hasDanger"
        :has-warning="hasWarning"
        :redraw="redraw"
        @update:show-experiments="showExperiments = $event"
        @update:current-experiment="currentExperiment = $event as any"
        @toggle-run="toggleRun"
        @load-exp="loadExp($event as any)"
        @explain-calcs="explainCalcs"
        @show-save-dialog="showSaveDialog = true"
        @open-load-dialog="openLoadDialog"
        @export-p-n-g="exportPNG"
        @print-circuit="printCircuit"
        @show-help="showHelp = true"
        @explain-m-n-a="showMNAExplanation"
        @select-fault="selectedFault = $event"
      />
      <WorkshopReportToolbar :workshop="workshop" :canvas-ref="canvasRef" lab-type="dc" />
    </div>

    <!-- Right: Readings Panel -->
    <DCReadingsPanel
      :t="t"
      :workshop="workshop"
      :selected-comp-fault="selectedCompFault"
      :redraw="redraw"
    />
  </div>

  <DCDialogs
    :t="t"
    :workshop="workshop"
    :show-calc-explanation="showCalcExplanation"
    :calc-explanation-html="calcExplanationHtml"
    :canvas-snapshot="canvasSnapshot"
    :show-save-dialog="showSaveDialog"
    :show-load-dialog="showLoadDialog"
    :circuit-name="circuitName"
    :saved-circuits="savedCircuits"
    :show-resistor-tutorial="showResistorTutorial"
    :editing-comp="editingComp"
    :resistor-band-preview="resistorBandPreview"
    :resistor-band-explanation="resistorBandExplanation"
    :resistor-color-chart="resistorColorChart"
    :show-help="showHelp"
    :selected-fault="selectedFault"
    :canvas-fullscreen="canvasFullscreen"
    @update:show-calc-explanation="showCalcExplanation = $event"
    @update:show-save-dialog="showSaveDialog = $event"
    @update:show-load-dialog="showLoadDialog = $event"
    @update:circuit-name="circuitName = $event"
    @update:show-resistor-tutorial="showResistorTutorial = $event"
    @update:show-help="showHelp = $event"
    @update:selected-fault="selectedFault = $event"
    @update:canvas-fullscreen="canvasFullscreen = $event"
    @do-save-circuit="doSaveCircuit"
    @do-load-circuit="doLoadCircuit"
    @do-delete-circuit="doDeleteCircuit"
    @export-p-n-g="exportPNG"
  />
</template>

<style scoped src="./dcLabScoped.css"></style>

<!-- Component layout styles (non-scoped so they apply to child components) -->
<style src="./dcLabLayout.css"></style>

<!-- Shared workshop styles (non-scoped so they apply to child components) -->
<style src="../shared/workshopTopBar.css"></style>
<style src="../shared/workshopBottomBar.css"></style>
<style src="../shared/workshopPalette.css"></style>
<style src="../shared/workshopCanvas.css"></style>
<style src="../shared/workshopFaults.css"></style>
<style src="../shared/workshopReadings.css"></style>

<!-- Non-scoped styles for teleported fullscreen overlay -->
<style src="../shared/workshopOverlays.css"></style>
<style src="../shared/workshopDialogs.css"></style>
<style src="../shared/workshopFullscreen.css"></style>
<style src="../shared/workshopResistor.css"></style>
