<template>
    <UTooltip arrow :text="tooltip">
        <NuxtLink :to="to" class="app-nav-button rounded-t-lg">
            <UIcon :name="icon" class="size-6" />
            <div class="corner left"></div>
            <div class="corner right"></div>
        </NuxtLink>
    </UTooltip>
</template>

<script lang="ts" setup>
    defineProps({
        tooltip: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: 'i-lucide-heart'
        },
        to: {
            type: String as any,
        },
    })
</script>

<style lang="sass" scoped>
    .app-nav-button
        position: relative
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        height: 100%
        aspect-ratio: 1
        transition: all 75ms

        &::after
            content: ''
            position: absolute
            right: 1.25rem
            left: 1.25rem
            bottom: .5rem
            background: currentColor
            height: 2.5px
            border-radius: .5rem
            opacity: 0
            transition: opacity 100ms ease-in-out

        &:hover,
        &:focus,
        &.router-link-active
            background: var(--ui-bg)

            .corner
                opacity: 1

        &:focus
            outline: 2px solid var(--ui-primary)
            outline-offset: -2px

        &.router-link-active
            color: var(--ui-primary)

        .corner
            position: absolute
            width: calc(var(--ui-radius) * 2)
            height: calc(var(--ui-radius) * 2)
            overflow: hidden
            pointer-events: none
            bottom: 0
            opacity: 0
            transition: all 75ms

            &::after
                content: ''
                position: absolute
                top: -100%
                width: 200%
                height: 200%
                border-radius: 50%
                box-shadow: 0 0 0 100rem var(--ui-bg)

            &.left
                right: 100%
                &::after
                    left: -100%

            &.right
                left: 100%
                &::after
                    right: -100%
</style>