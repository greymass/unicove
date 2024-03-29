<script lang="ts">
    import {Asset} from 'anchor-link'
    import {getContext} from 'svelte'
    import type {Writable} from 'svelte/store'
    import {derived, writable} from 'svelte/store'

    import {BuyRamBytes} from '~/abi-types'
    import {ChainFeatures} from '~/config'
    import {activeBlockchain, activeSession, currentAccount} from '~/store'
    import {systemToken} from '~/stores/tokens'
    import {systemTokenBalance} from '~/stores/balances'
    import {stateRAM} from '~/pages/resources/resources'

    import type {FormTransaction} from '~/ui-types'
    import Button from '~/components/elements/button.svelte'
    import Form from '~/components/elements/form.svelte'
    import FormBalance from '~/components/elements/form/balance.svelte'
    import InputAsset from '~/components/elements/input/asset.svelte'
    import InputErrorMessage from '~/components/elements/input/errorMessage.svelte'
    import Segment from '~/components/elements/segment.svelte'

    const context: FormTransaction = getContext('transaction')

    let kb: Writable<string> = writable('')
    let error: string | undefined

    const {BuyRAM} = ChainFeatures

    // Create a derived store of the field we expect to be modified
    export const field = derived([currentAccount], ([$currentAccount]) => {
        if ($currentAccount) {
            return $currentAccount.ram_quota
        }
        return undefined
    })

    // Figure out the cost of buying this RAM based on the RAM state
    export const cost = derived(
        [activeBlockchain, kb, stateRAM],
        ([$activeBlockchain, $kb, $stateRAM]) => {
            if ($stateRAM && $kb) {
                return Asset.from(
                    $stateRAM.price_per(Number($kb) * 1000),
                    $activeBlockchain.coreTokenSymbol
                )
            }
        }
    )

    async function buyrambytes() {
        try {
            // Perform the transaction
            const result = await $activeSession!.transact({
                actions: [
                    {
                        authorization: [$activeSession!.auth],
                        account: 'eosio',
                        name: 'buyrambytes',
                        data: BuyRamBytes.from({
                            payer: $activeSession!.auth.actor,
                            receiver: $activeSession!.auth.actor,
                            bytes: Number($kb) * 1000,
                        }),
                    },
                ],
            })

            // If the context exists and this is part of a FormTransaction
            if (context) {
                // Pass the transaction ID to the parent
                const txid = String(result.transaction.id)
                context.setTransaction(txid)

                // Await an update on the field expected for this transaction
                context.awaitAccountUpdate(field)
            }
        } catch (e) {
            error = String(e)
        }
    }
</script>

<style>
</style>

<Segment background="white">
    {#if $activeBlockchain?.chainFeatures.has(BuyRAM)}
        <Form on:submit={buyrambytes}>
            <p>Amount of kb to buy:</p>
            <InputAsset focus fluid name="kb" placeholder={`number of kb`} bind:value={$kb} />
            {#if $systemToken}
                <FormBalance token={$systemToken} balance={systemTokenBalance} />
            {/if}
            <InputErrorMessage errorMessage={error} />
            <Button style="primary" fluid size="large" formValidation on:action={buyrambytes}
                >Buy {$kb} kb for {$cost}</Button
            >
        </Form>
    {:else}
        <p>This feature is unavailable on this blockchain.</p>
    {/if}
</Segment>
