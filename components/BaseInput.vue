<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      v-bind="$attrs"
      class="rounded-2xl border px-4 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
      :class="error ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-200 text-gray-900'"
      @input="handleInput"
      @focus="emit('clear-error')"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'clear-error'): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

