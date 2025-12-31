<script setup>
import { useUIStore } from '../../stores/uiStore'

const uiStore = useUIStore()

function handleConfirm() {
  uiStore.confirmDialogAction()
}

function handleCancel() {
  uiStore.closeConfirmDialog()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.showConfirmDialog" class="overlay confirm-dialog-overlay" @click="handleCancel">
      <div class="modal confirm-dialog modal-instant" @click.stop>
        <h2 class="dialog-title">{{ uiStore.confirmDialogConfig.title }}</h2>
        <p class="dialog-message">{{ uiStore.confirmDialogConfig.message }}</p>
        <div class="dialog-actions">
          <button class="dialog-button secondary" @click="handleCancel">
            {{ uiStore.confirmDialogConfig.cancelText }}
          </button>
          <button class="dialog-button primary" @click="handleConfirm">
            {{ uiStore.confirmDialogConfig.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-dialog-overlay {
  z-index: 3000;
}

.confirm-dialog {
  min-width: 400px;
  max-width: 500px;
  padding: 32px;
  z-index: 3001;
}

.dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 16px 0;
}

.dialog-message {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.7);
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-button {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.dialog-button.primary {
  background: #FF3B30;
  color: white;
}

.dialog-button.primary:hover {
  background: #D70015;
  transform: scale(1.05);
}

.dialog-button.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
}

.dialog-button.secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.dialog-button:active {
  transform: scale(0.98);
}

@media (prefers-color-scheme: dark) {
  .dialog-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .dialog-message {
    color: rgba(255, 255, 255, 0.7);
  }

  .dialog-button.primary {
    background: #FF453A;
  }

  .dialog-button.primary:hover {
    background: #D70015;
  }

  .dialog-button.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .dialog-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 640px) {
  .confirm-dialog {
    min-width: 0;
    width: 90vw;
    padding: 24px;
  }

  .dialog-title {
    font-size: 20px;
  }

  .dialog-message {
    font-size: 15px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }

  .dialog-button {
    width: 100%;
  }
}
</style>
