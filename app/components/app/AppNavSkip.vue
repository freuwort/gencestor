<template>
    <a class="app-nav-skip" tabindex="0">
        <slot>{{ label }}</slot>
        <UIcon v-if="icon" :name="icon" class="size-4" />
    </a>
</template>

<script lang="ts" setup>
    defineProps({
        label: String,
        icon: String,
    })
</script>

<style lang="sass" scoped>
    .app-nav-skip
        position: fixed
        z-index: 1000
        top: .5rem
        left: .5rem
        display: flex
        align-items: center
        gap: 1rem
        padding: .5rem 1rem
        border-radius: var(--radius-md)
        background: var(--ui-primary)
        color: var(--ui-text-inverted)
        opacity: 0
        pointer-events: none
        transform: translateY(-1rem)
        transition: all 100ms
        box-shadow: var(--shadow-2xl)

        &:focus
            opacity: 1
            pointer-events: all
            transform: translateY(0)
            outline: none
</style>