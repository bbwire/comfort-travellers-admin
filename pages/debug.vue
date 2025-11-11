<template>
  <div style="padding: 20px; background: white; min-height: 100vh;">
    <h1 style="color: red; font-size: 24px;">DEBUG PAGE</h1>
    <p>If you can see this, Vue is rendering!</p>
    <p>Current time: {{ new Date().toLocaleString() }}</p>
    <button @click="testClick" style="padding: 10px; background: blue; color: white; border: none; cursor: pointer;">
      Test Button (click me)
    </button>
    <p v-if="clicked">Button was clicked! Vue reactivity works!</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
})

const clicked = ref(false)

const testClick = () => {
  clicked.value = true
  alert('Button clicked! Vue is working!')
}
</script>

