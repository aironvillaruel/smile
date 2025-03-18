<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 flex items-center justify-center bg-zinc-900/60 p-4 md:p-0 z-50"
  >
    <div
      class="bg-white dark:bg-zinc-950 border-2 border-orange-900 dark:border-white shadow-2xl p-6 rounded-lg relative scale-up-center md:w-1/2  flex justify-center flex-col items-center gap-5"
    >
      <!-- Modal content goes here -->
      <slot></slot>

      <!-- Close Button -->
      <p
        class="absolute top-2 right-2 p-2 hover:scale-125 transition-all duration-300 cursor-pointer "
        @click="closeModal"
      >
        <font-awesome-icon icon="fa-solid fa-circle-xmark" class="text-orange-900 text-2xl" />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false, // Visibility state of the modal
    };
  },
  methods: {
    openModal() {
      this.isVisible = true; // Show modal
    },
    closeModal() {
      this.isVisible = false; // Hide modal
    },
  },
  mounted() {
    // Expose openModal to the parent component
    this.$emit('expose', {
      openModal: this.openModal, // Expose openModal as a method
    });
  },
};
</script>

<style></style>
