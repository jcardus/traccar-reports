<script>
    import "../../app.css";
import {Alert} from "flowbite-svelte";
import {alert, clearAlert} from '$lib/store'
import {
    ExclamationCircleOutline,
    InfoCircleSolid,
    MapPinAltOutline,
    TruckOutline,
    UserOutline
} from "flowbite-svelte-icons";
import { page } from "$app/state";
import {t} from "$lib/i18n.js";
// noinspection JSFileReferences
import config from 'tailwindcss/defaultTheme.js'
import {onMount} from "svelte";
let activeUrl = $state(page.url.pathname);

let isMinified = $state(false);
$effect(() => {
    activeUrl = page.url.pathname;
});

let {children} = $props()
let alertMessage = $state('')

const unsubscribeAlert = alert.subscribe(value => {
    alertMessage = value;
    if (value) {
        setTimeout(() => {
            clearAlert();
        }, 5000);
    }
});
let items = [
    { name: t('Driver'), Icon: UserOutline, href: '/treports/driver' },
    { name: t('Speeding'), Icon: ExclamationCircleOutline, href: '/treports/speeding' },
    { name: t('ECO driving'), Icon: TruckOutline, href: '/treports/eco' },
    { name: t('Positions'), Icon: MapPinAltOutline, href: '/treports/positions' }
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

function toggleMinify() {
    isMinified = !isMinified;
}
</script>
<!-- Navigation Toggle -->
<div class="lg:hidden py-16 text-center">
    <button type="button" class="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-start bg-gray-800 border border-gray-800 text-white text-sm font-medium rounded-lg shadow-2xs align-middle hover:bg-gray-950 focus:outline-hidden focus:bg-gray-900 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-200 dark:focus:bg-neutral-200" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-sidebar-content-push-to-mini-sidebar" aria-label="Toggle navigation" data-hs-overlay="#hs-sidebar-content-push-to-mini-sidebar">
        Open
    </button>
</div>
<!-- End Navigation Toggle -->

<!-- Sidebar -->
<div id="hs-sidebar-content-push-to-mini-sidebar"
     class="
        hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 {isMinified ? 'w-16' : 'w-64'}
        hs-overlay-open:translate-x-0
        -translate-x-full transition-all duration-300 transform
        h-full
        hidden
        overflow-x-hidden
        fixed top-0 start-0 bottom-0 z-60
        bg-gray-100 dark:bg-gray-800
        "
     role="dialog" tabindex="-1" aria-label="Sidebar" >

    <div class="relative flex flex-col h-full max-h-full ">
        <!-- Header -->
        <header class="py-4 px-2 flex items-center gap-x-2 {isMinified ? 'justify-center' : 'justify-end'}">
            <div class="lg:hidden">
                <!-- Close Button -->
                <button type="button" class="flex justify-center items-center gap-x-3 size-6 bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:text-neutral-200" data-hs-overlay="#hs-sidebar-content-push-to-mini-sidebar">
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    <span class="sr-only">Close</span>
                </button>
                <!-- End Close Button -->
            </div>
            <div>
                <!-- Toggle Button -->
                <button type="button" onclick={toggleMinify} class="flex justify-center items-center flex-none gap-x-3 size-9 text-sm text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:text-neutral-200" aria-label="Minify navigation">
                    {#if isMinified}
                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/></svg>
                    {:else}
                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15-3-3 3-3"/></svg>
                    {/if}
                    <span class="sr-only">Navigation Toggle</span>
                </button>
                <!-- End Toggle Button -->
            </div>
        </header>
        <!-- End Header -->

        <!-- Body -->
        <nav class="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div class=" pb-0 px-2  w-full flex flex-col flex-wrap" >
                <ul class="space-y-1">
                    {#each items as { name, Icon, href } (name)}
                    <li>
                        <a class="nav-item min-h-[36px] flex items-center py-2 text-sm rounded-lg
                            hover:bg-gray-100  focus:bg-gray-100 dark:hover:bg-primary-100 dark:hover:text-primary-600  dark:focus:text-primary-600
                            dark:focus:bg-neutral-700
                            {isMinified ? 'justify-center px-0' : 'gap-x-3.5 px-2.5'}
                            {activeUrl === href ?
                            'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200' :
                            'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-white'
                            }" {href} title={isMinified ? name : ''}>
                            <Icon/>
                            {#if !isMinified}
                                <span>{name}</span>
                            {/if}
                        </a>
                    </li>
                    {/each}
                </ul>
            </div>
        </nav>
        <!-- End Body -->
    </div>

</div>
<div class="p-4 h-full transition-all duration-300 {isMinified ? 'lg:ml-16' : 'lg:ml-64'}">
    {@render children()}
</div>

{#if alertMessage}
    <div class="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
        <Alert border>
            <InfoCircleSolid slot="icon" class="w-5 h-5" />
            <span class="font-medium">{alertMessage}</span>
        </Alert>
    </div>
{/if}

<!-- End Sidebar -->
