<script setup lang="ts">
import type { FormErrors } from './types'

interface Props {
  name: string
  url: string
  errors: FormErrors
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:url', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="basic-info-section">
    <div class="form-group">
      <label for="website-name" class="form-label">Name</label>
      <input
        id="website-name"
        :value="name"
        type="text"
        class="form-input"
        :class="{ error: errors.name }"
        placeholder="e.g., GitHub"
        maxlength="50"
        @input="emit('update:name', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
    </div>

    <div class="form-group">
      <label for="website-url" class="form-label">URL</label>
      <input
        id="website-url"
        :value="url"
        type="text"
        class="form-input"
        :class="{ error: errors.url }"
        placeholder="e.g., https://github.com"
        @input="emit('update:url', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="errors.url" class="error-message">{{ errors.url }}</span>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.9);
  background: white;
  transition: all var(--transition-fast);
}

.form-input:focus {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.error {
  border-color: #FF3B30;
}

.form-input::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

.error-message {
  display: block;
  font-size: 13px;
  color: #FF3B30;
  margin-top: 6px;
}

@media (prefers-color-scheme: dark) {
  .form-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .form-input {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .form-input:focus {
    border-color: #0A84FF;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.2);
  }

  .form-input.error {
    border-color: #FF453A;
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .error-message {
    color: #FF453A;
  }
}
</style>
