<template>
  <div class="dash-page">
    <h2>الامتحانات</h2>
    <TeacherHelpButton :tab-id="`quizzes-${view}`" />
    <QuizManager v-if="view === 'list'" @create="onCreate" @edit="onEdit" @results="onResults" />
    <QuizBuilder v-else-if="view === 'builder'" :editId="editId" @saved="onSaved" @cancel="onCancel" />
    <QuizResults v-else-if="view === 'results'" @back="onBackToList" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QuizManager from '@/components/teacher/QuizManager.vue'
import QuizBuilder from '@/components/teacher/QuizBuilder.vue'
import QuizResults from './QuizResults.vue'
import TeacherHelpButton from '@/components/teacher/TeacherHelpButton.vue'

const view = ref<'list' | 'builder' | 'results'>('list')
const editId = ref<number | null>(null)

function onCreate() {
  editId.value = null
  view.value = 'builder'
}

function onEdit(id: number) {
  editId.value = id
  view.value = 'builder'
}

function onResults() {
  view.value = 'results'
}

function onSaved() {
  view.value = 'list'
  editId.value = null
}

function onCancel() {
  view.value = 'list'
  editId.value = null
}

function onBackToList() {
  view.value = 'list'
}
</script>
