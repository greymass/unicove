<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {router} from 'tinro'

    import {version, isRelease, releaseVersion} from '~/config'
    import {preferences} from '~/store'
    import type {NavigationItem} from '~/ui-types'

    import Icon from '~/components/elements/icon.svelte'
    import Logo from '~/components/elements/logo.svelte'
    import Unicove from '~/components/elements/unicove.svelte'

    // Dispatched when button is activated via keyboard or click
    const dispatch = createEventDispatcher<{collapse: boolean}>()

    $: currentPath = $router.path
    $: expandAdvanced = $preferences.expandNavbarAdvanced

    export let expand = true
    export let floating = false

    export let primaryNavigation: NavigationItem[] = []
    export let advancedNavigation: NavigationItem[] = []

    function handleHamburger() {
        if (expand) {
            dispatch('collapse', false)
        } else {
            preferences.expandNavbar = true
        }
    }

    const pathMatches = (item: NavigationItem): boolean => {
        if (item.exactPath) {
            return currentPath === item.path
        }
        return currentPath.startsWith(item.path)
    }
</script>

<style type="scss">
    nav {
        transition: 300ms ease-in-out;
        transition-property: width, min-width;
        background-image: url('/images/nav-noise-light.png');
        padding: 18px 26px;
        width: 268px;
        min-width: 268px;
        height: 100vh;
        :global(.darkmode) & {
            background-image: url('/images/nav-noise-dark.png');
        }
        header {
            display: flex;
            align-items: flex-start;
            height: 60px;
            border-bottom: 1px solid var(--divider-grey);
            .title {
                display: flex;
                flex: 1;
                flex-direction: column;
                margin-left: 12px;
                .unicove {
                    margin-bottom: 4px;
                }
                .version {
                    color: var(--dark-grey);
                    font-size: 10px;
                    line-height: 12px;
                }
            }
            .button {
                color: var(--main-blue);
                cursor: pointer;
                display: none;
            }
        }

        > ul {
            margin-top: 26px;
            > li {
                border-radius: 8px;
                a {
                    color: var(--main-blue);
                    cursor: pointer;
                    display: flex;
                    text-decoration: none;
                    height: 32px;
                    align-items: center;
                    font-weight: 500;
                }
                margin-bottom: 8px;
                &:hover {
                    background-color: var(--background-highlight-hover);
                }
                &.active {
                    background-color: var(--background-highlight);
                    border-radius: 8px;
                    a {
                        color: var(--main-black);
                    }
                }
                .icon {
                    padding: 8px;
                    :global(.icon) {
                        vertical-align: middle;
                    }
                }
                .name {
                    padding-left: 5px;
                }
                &.advanced {
                    cursor: pointer;
                    color: var(--dark-grey);
                    font-family: Inter;
                    font-style: normal;
                    font-weight: 600;
                    font-size: 10px;
                    line-height: 26px;
                    letter-spacing: 0.1px;
                    text-transform: uppercase;
                    margin-top: 27px;
                    .icon {
                        float: right;
                        padding: 0;
                        margin-right: 10px;
                        :global(.icon) {
                            vertical-align: middle;
                        }
                    }
                    &:hover {
                        background-color: transparent;
                    }
                }
                ul {
                    margin-top: 0;
                }
            }
        }

        // &.collapsed {
        //     width: 97px;
        //     min-width: 97px;
        //     header {
        //         justify-content: center;
        //     }
        //     ul li a {
        //         justify-content: center;
        //         .name {
        //             display: none;
        //         }
        //     }
        // }

        &.floating {
            position: absolute;
            z-index: 2001;
            top: 0;
            left: 0;
        }
    }
</style>

<nav class:floating>
    <header>
        <Logo width={40} />
        <div class="title">
            <div class="unicove">
                <Unicove width={90} />
            </div>
            <div class="version">
                {#if isRelease}
                    {releaseVersion}
                {:else}
                    {version}
                {/if}
            </div>
        </div>
        <span class="button" on:click={handleHamburger}>
            {#if expand}
                <Icon name="x" />
            {:else}
                <Icon name="menu" />
            {/if}
        </span>
    </header>
    <ul>
        {#each primaryNavigation as item}
            <li class:active={pathMatches(item)}>
                <a href={item.path}>
                    <span class="icon">
                        <Icon name={item.icon} />
                    </span>
                    <span class="name">{item.name}</span>
                </a>
            </li>
        {/each}
        {#if advancedNavigation.length}
            <li
                class="advanced"
                on:click={() => {
                    preferences.expandNavbarAdvanced = !expandAdvanced
                }}
            >
                <span class="name">Advanced</span>
                <span class="icon">
                    <Icon name={expandAdvanced ? 'chevron-down' : 'chevron-right'} />
                </span>
            </li>
            <li>
                {#if $preferences.expandNavbarAdvanced}
                    <ul>
                        {#each advancedNavigation as item}
                            <li class:active={pathMatches(item)}>
                                <a href={item.path}>
                                    <span class="icon">
                                        <Icon name={item.icon} />
                                    </span>
                                    <span class="name">{item.name}</span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/if}
    </ul>
</nav>
