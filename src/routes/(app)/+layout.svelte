<script>
    import "../../app.css";
import {Alert} from "flowbite-svelte";
import {alert, error, clearAlert, clearError} from '$lib/store'
import {ExclamationCircleOutline, FileLinesSolid, InfoCircleSolid, TruckOutline} from "flowbite-svelte-icons";
import { Sidebar, SidebarGroup, SidebarItem, SidebarButton, uiHelpers } from "flowbite-svelte";
import { page } from "$app/state";
import {t} from "$lib/i18n.js";
import config from "tailwindcss/defaultTheme.js";
import {onMount} from "svelte";
let activeUrl = $state(page.url.pathname);

const demoSidebarUi = uiHelpers();
let isDemoOpen = $state(false);
const closeDemoSidebar = demoSidebarUi.close;
$effect(() => {
    isDemoOpen = demoSidebarUi.isOpen;
    activeUrl = page.url.pathname;
});

let {children} = $props()
let errorMessage = $state('')
let alertMessage = $state('')

const unsubscribe = error.subscribe(value => {
    errorMessage = value;
    if (value) {
        setTimeout(() => {
            clearError();
        }, 5000);
    }
});

const unsubscribeAlert = alert.subscribe(value => {
    alertMessage = value;
    if (value) {
        setTimeout(() => {
            clearAlert();
        }, 5000);
    }
});
let items = [
    { name: t('Positions'), Icon: FileLinesSolid, href: '/reports/positions' },
    { name: t('Speeding'), Icon: ExclamationCircleOutline, href: '/reports/speeding' },
    { name: t('ECO driving'), Icon: TruckOutline, href: '/reports/eco' }
];
let lg,sm;
const checkWidth = () => {
    lg = window.matchMedia(`(min-width: ${config.screens.lg})`).matches
    sm = window.matchMedia(`(min-width: ${config.screens.sm})`).matches
}
onMount(() => {
    checkWidth()
    window.addEventListener('resize', checkWidth);
    return () => {
        window.removeEventListener('resize', checkWidth);
    };
})
</script>

<SidebarButton onclick={demoSidebarUi.toggle} class="mb-2" />
<div class="relative h-full">
    <Sidebar {activeUrl} backdrop={false} isOpen={isDemoOpen} closeSidebar={closeDemoSidebar} params={{ x: -50, duration: 50 }} class="z-50 h-full" position="absolute" activeClass="p-2" nonActiveClass="p-2">
        <SidebarGroup>
            {#each items as { name, Icon, href } (name)}
                    <SidebarItem
                            label={name}
                            {href}
                            active={activeUrl === href}
                    >
                        {#snippet icon()}
                            <Icon  />
                        {/snippet}
                    </SidebarItem>
            {/each}
        </SidebarGroup>
    </Sidebar>
    <div class="min-h-full h-96 overflow-auto px-4 md:ml-64">
        <div class="p-4 dark:border-gray-700  h-full">
            {@render children()}
        </div>
    </div>
</div>
{#if alertMessage}
    <div class="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
        <Alert border>
            <InfoCircleSolid slot="icon" class="w-5 h-5" />
            <span class="font-medium">{alertMessage}</span>
        </Alert>
    </div>
{/if}
